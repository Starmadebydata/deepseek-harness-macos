import Darwin
import Foundation
import Observation

@MainActor
@Observable
final class HarnessService {
    static let serverURL = URL(string: "http://127.0.0.1:3080/")!

    private(set) var state: HarnessState = .idle
    private(set) var reloadToken = UUID()
    private(set) var recentLog = ""

    private var process: Process?
    private var ownsServer = false
    private var outputPipe: Pipe?

    func start() async {
        guard !state.isReady else { return }

        state = .connecting
        if await serverResponds() {
            ownsServer = true
            state = .ready(ownsServer: true)
            reloadToken = UUID()
            return
        }

        state = .launching
        guard let executable = DSHExecutableResolver().resolve() else {
            state = .failed("没有找到 dsh。请先安装 DeepSeek Harness，再重新连接。")
            return
        }

        do {
            try launch(executable: executable)
        } catch {
            state = .failed("DeepSeek Harness 启动失败：\(error.localizedDescription)")
            return
        }

        for _ in 0..<40 {
            if await serverResponds() {
                state = .ready(ownsServer: true)
                reloadToken = UUID()
                return
            }
            if process?.isRunning == false {
                let detail = recentLog.trimmingCharacters(in: .whitespacesAndNewlines)
                state = .failed(detail.isEmpty ? "DeepSeek Harness 启动后意外退出。" : detail)
                return
            }
            try? await Task.sleep(for: .milliseconds(250))
        }

        stopServer()
        state = .failed("等待 DeepSeek Harness 启动超时，请重新连接。")
    }

    func restart() async {
        if ownsServer {
            stopServer()
            try? await Task.sleep(for: .milliseconds(350))
        }
        state = .idle
        await start()
    }

    func stopServer() {
        guard ownsServer else { return }
        ownsServer = false
        if let process, process.isRunning {
            process.terminate()
            self.process = nil
            outputPipe = nil
            return
        }
        if let pid = Self.listeningPID(port: 3080) {
            kill(pid, SIGTERM)
        }
    }

    private static func listeningPID(port: Int) -> pid_t? {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/sbin/lsof")
        process.arguments = ["-nP", "-iTCP:\(port)", "-sTCP:LISTEN", "-t"]
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = Pipe()
        do {
            try process.run()
            process.waitUntilExit()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let text = String(data: data, encoding: .utf8) ?? ""
            let first = text.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: "\n").first
            return first.flatMap { pid_t(String($0)) }
        } catch {
            return nil
        }
    }

    private func launch(executable: URL) throws {
        let process = Process()
        let pipe = Pipe()

        process.executableURL = executable
        process.arguments = ["web", "--host", "127.0.0.1", "--port", "3080"]
        process.currentDirectoryURL = FileManager.default.homeDirectoryForCurrentUser
        process.standardOutput = pipe
        process.standardError = pipe

        var environment = ProcessInfo.processInfo.environment
        let binaryDirectory = executable.deletingLastPathComponent().path
        let existingPath = environment["PATH"] ?? "/usr/bin:/bin:/usr/sbin:/sbin"
        environment["PATH"] = "\(binaryDirectory):\(existingPath)"
        process.environment = environment

        pipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8) else { return }
            Task { @MainActor [weak self] in
                guard let self else { return }
                self.recentLog = String((self.recentLog + text).suffix(4_000))
            }
        }

        process.terminationHandler = { [weak self] terminated in
            Task { @MainActor [weak self] in
                guard let self, self.ownsServer else { return }
                self.process = nil
                self.outputPipe = nil
                self.ownsServer = false
                if self.state.isReady {
                    self.state = .failed("DeepSeek Harness 已停止（退出状态 \(terminated.terminationStatus)）。")
                }
            }
        }

        try process.run()
        self.process = process
        outputPipe = pipe
        ownsServer = true
    }

    private func serverResponds() async -> Bool {
        var request = URLRequest(url: Self.serverURL)
        request.timeoutInterval = 1

        do {
            let (_, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { return false }
            return (200..<500).contains(http.statusCode)
        } catch {
            return false
        }
    }
}
