import Foundation

struct DSHExecutableResolver {
    private let fileManager: FileManager
    private let homeDirectory: URL

    init(
        fileManager: FileManager = .default,
        homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser
    ) {
        self.fileManager = fileManager
        self.homeDirectory = homeDirectory
    }

    func resolve() -> URL? {
        for path in fixedCandidates where fileManager.isExecutableFile(atPath: path) {
            return URL(fileURLWithPath: path)
        }

        let nvmRoot = homeDirectory.appending(path: ".nvm/versions/node")
        guard let versions = try? fileManager.contentsOfDirectory(
            at: nvmRoot,
            includingPropertiesForKeys: nil,
            options: [.skipsHiddenFiles]
        ) else {
            return nil
        }

        return versions
            .sorted { $0.lastPathComponent.localizedStandardCompare($1.lastPathComponent) == .orderedDescending }
            .map { $0.appending(path: "bin/dsh") }
            .first { fileManager.isExecutableFile(atPath: $0.path) }
    }

    private var fixedCandidates: [String] {
        let environmentPath = ProcessInfo.processInfo.environment["PATH"] ?? ""
        let pathCandidates = environmentPath
            .split(separator: ":")
            .map { String($0) + "/dsh" }

        return pathCandidates + [
            "/opt/homebrew/bin/dsh",
            "/usr/local/bin/dsh"
        ]
    }
}
