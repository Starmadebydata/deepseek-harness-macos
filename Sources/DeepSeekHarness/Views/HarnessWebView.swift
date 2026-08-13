import SwiftUI
import WebKit

struct HarnessWebView: NSViewRepresentable {
    let url: URL
    let reloadToken: UUID

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeNSView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsMagnification = true
        webView.setValue(false, forKey: "drawsBackground")
        webView.load(URLRequest(url: url))
        context.coordinator.lastReloadToken = reloadToken
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        guard context.coordinator.lastReloadToken != reloadToken else { return }
        context.coordinator.lastReloadToken = reloadToken
        webView.load(URLRequest(url: url))
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        var lastReloadToken: UUID?

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void
        ) {
            guard let target = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }

            if target.host == "127.0.0.1" || target.host == "localhost" {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
                NSWorkspace.shared.open(target)
            }
        }
    }
}
