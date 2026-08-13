import Foundation

enum HarnessState: Equatable {
    case idle
    case connecting
    case launching
    case ready(ownsServer: Bool)
    case failed(String)

    var statusText: String {
        switch self {
        case .idle:
            "准备启动"
        case .connecting:
            "正在连接 DeepSeek Harness…"
        case .launching:
            "正在启动 DeepSeek Harness…"
        case .ready(let ownsServer):
            ownsServer ? "DeepSeek Harness 已由本应用启动" : "已连接到正在运行的 DeepSeek Harness"
        case .failed(let message):
            message
        }
    }

    var isReady: Bool {
        if case .ready = self { return true }
        return false
    }
}
