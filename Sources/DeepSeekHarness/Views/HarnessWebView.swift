import AppKit
import SwiftUI
import UniformTypeIdentifiers
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
        configuration.userContentController.add(context.coordinator, name: Coordinator.browserMessageName)
        configuration.userContentController.add(context.coordinator, name: Coordinator.mediaPickerMessageName)
        configuration.userContentController.add(context.coordinator, name: Coordinator.savePlaylistMessageName)
        configuration.userContentController.add(context.coordinator, name: Coordinator.ebookPickerMessageName)

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsMagnification = true
        webView.setValue(false, forKey: "drawsBackground")
        context.coordinator.attach(to: webView)
        webView.load(URLRequest(url: url))
        context.coordinator.lastReloadToken = reloadToken
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        guard context.coordinator.lastReloadToken != reloadToken else { return }
        context.coordinator.lastReloadToken = reloadToken
        webView.load(URLRequest(url: url))
    }

    static func dismantleNSView(_ nsView: WKWebView, coordinator: Coordinator) {
        nsView.configuration.userContentController.removeScriptMessageHandler(forName: Coordinator.browserMessageName)
        nsView.configuration.userContentController.removeScriptMessageHandler(forName: Coordinator.mediaPickerMessageName)
        nsView.configuration.userContentController.removeScriptMessageHandler(forName: Coordinator.savePlaylistMessageName)
        nsView.configuration.userContentController.removeScriptMessageHandler(forName: Coordinator.ebookPickerMessageName)
        coordinator.destroyEmbeddedBrowser()
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        static let browserMessageName = "dshNativeBrowser"
        static let mediaPickerMessageName = "dshMediaPicker"
        static let savePlaylistMessageName = "dshSavePlaylist"
        static let ebookPickerMessageName = "dshEbookPicker"

        var lastReloadToken: UUID?
        weak var mainWebView: WKWebView?
        private var embeddedBrowser: WKWebView?
        private var browserHiddenBeforeResize = true

        func attach(to webView: WKWebView) {
            mainWebView = webView
        }

        func destroyEmbeddedBrowser() {
            embeddedBrowser?.stopLoading()
            embeddedBrowser?.removeFromSuperview()
            embeddedBrowser = nil
        }

        private func presentMediaPicker() {
            guard let window = mainWebView?.window else { return }
            let panel = NSOpenPanel()
            panel.title = "选择音频或视频"
            panel.prompt = "选择"
            panel.allowsMultipleSelection = true
            panel.canChooseDirectories = false
            panel.canChooseFiles = true
            panel.allowedContentTypes = [.mp3, .mpeg4Movie]
            panel.beginSheetModal(for: window) { [weak self] response in
                guard let self else { return }
                let paths = response == .OK ? panel.urls.map { $0.path } : []
                self.sendMediaPicked(paths: paths)
            }
        }

        private func sendMediaPicked(paths: [String]) {
            guard let mainWebView else { return }
            guard let data = try? JSONSerialization.data(withJSONObject: ["paths": paths]),
                  let json = String(data: data, encoding: .utf8) else { return }
            mainWebView.evaluateJavaScript(
                "window.dispatchEvent(new CustomEvent('dsh-media-picked',{detail:\(json)}));"
            )
        }

        private func presentEbookPicker() {
            guard let window = mainWebView?.window else { return }
            let panel = NSOpenPanel()
            panel.title = "导入电子书"
            panel.prompt = "导入"
            panel.message = "选择 EPUB / PDF 文件，或选择一个文件夹批量导入其中的电子书。"
            panel.allowsMultipleSelection = true
            panel.canChooseDirectories = true
            panel.canChooseFiles = true
            panel.allowedContentTypes = [.pdf, .epub]
            panel.beginSheetModal(for: window) { [weak self] response in
                guard let self else { return }
                let paths = response == .OK ? panel.urls.map { $0.path } : []
                self.sendEbookPicked(paths: paths)
            }
        }

        private func sendEbookPicked(paths: [String]) {
            guard let mainWebView else { return }
            guard let data = try? JSONSerialization.data(withJSONObject: ["paths": paths]),
                  let json = String(data: data, encoding: .utf8) else { return }
            mainWebView.evaluateJavaScript(
                "window.dispatchEvent(new CustomEvent('dsh-ebook-picked',{detail:\(json)}));"
            )
        }

        private func presentSavePlaylistPanel(content: String) {
            guard let window = mainWebView?.window else { return }
            let panel = NSSavePanel()
            panel.title = "导出播放列表"
            panel.prompt = "保存"
            panel.nameFieldStringValue = "playlist.m3u"
            panel.canCreateDirectories = true
            panel.beginSheetModal(for: window) { response in
                if response == .OK, let url = panel.url {
                    try? content.write(to: url, atomically: true, encoding: .utf8)
                }
            }
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == Self.mediaPickerMessageName {
                presentMediaPicker()
                return
            }
            if message.name == Self.ebookPickerMessageName {
                presentEbookPicker()
                return
            }
            if message.name == Self.savePlaylistMessageName {
                if let body = message.body as? [String: Any], let content = body["content"] as? String {
                    presentSavePlaylistPanel(content: content)
                }
                return
            }
            guard message.name == Self.browserMessageName,
                  let body = message.body as? [String: Any],
                  let action = body["action"] as? String else { return }

            switch action {
            case "show":
                let browser = ensureEmbeddedBrowser()
                updateBrowserFrame(browser, body: body)
                browser.isHidden = false
                if let raw = body["url"] as? String,
                   let target = URL(string: raw),
                   !raw.isEmpty,
                   browser.url == nil {
                    browser.load(URLRequest(url: target))
                }
                sendBrowserState()
            case "hide":
                embeddedBrowser?.isHidden = true
            case "frame":
                let browser = ensureEmbeddedBrowser()
                updateBrowserFrame(browser, body: body)
                browser.isHidden = false
            case "navigate":
                guard let raw = body["url"] as? String, let target = URL(string: raw) else { return }
                let browser = ensureEmbeddedBrowser()
                browser.isHidden = false
                browser.load(URLRequest(url: target))
            case "back":
                if embeddedBrowser?.canGoBack == true { embeddedBrowser?.goBack() }
            case "forward":
                if embeddedBrowser?.canGoForward == true { embeddedBrowser?.goForward() }
            case "reload":
                embeddedBrowser?.reload()
            case "stop":
                embeddedBrowser?.stopLoading()
            case "resizeStart":
                browserHiddenBeforeResize = embeddedBrowser?.isHidden ?? true
                embeddedBrowser?.isHidden = true
            case "resizeEnd":
                embeddedBrowser?.isHidden = browserHiddenBeforeResize
            default:
                break
            }
        }

        private func ensureEmbeddedBrowser() -> WKWebView {
            if let embeddedBrowser { return embeddedBrowser }

            let configuration = WKWebViewConfiguration()
            configuration.websiteDataStore = .default()
            let browser = WKWebView(frame: .zero, configuration: configuration)
            browser.navigationDelegate = self
            browser.uiDelegate = self
            browser.allowsMagnification = true
            browser.setValue(false, forKey: "drawsBackground")
            browser.isHidden = true
            mainWebView?.addSubview(browser, positioned: .above, relativeTo: nil)
            embeddedBrowser = browser
            return browser
        }

        private func updateBrowserFrame(_ browser: WKWebView, body: [String: Any]) {
            guard let mainWebView,
                  let x = body["x"] as? Double,
                  let y = body["y"] as? Double,
                  let width = body["width"] as? Double,
                  let height = body["height"] as? Double else { return }

            let frameY = mainWebView.isFlipped ? y : mainWebView.bounds.height - y - height
            browser.frame = NSRect(
                x: max(0, x),
                y: max(0, frameY),
                width: max(1, min(width, mainWebView.bounds.width - x)),
                height: max(1, min(height, mainWebView.bounds.height - max(0, frameY)))
            )
        }

        private func sendBrowserState(error: String? = nil) {
            guard let mainWebView, let browser = embeddedBrowser else { return }
            var payload: [String: Any] = [
                "url": browser.url?.absoluteString ?? "",
                "title": browser.title ?? "",
                "canGoBack": browser.canGoBack,
                "canGoForward": browser.canGoForward,
                "loading": browser.isLoading
            ]
            if let error { payload["error"] = error }
            guard let data = try? JSONSerialization.data(withJSONObject: payload),
                  let json = String(data: data, encoding: .utf8) else { return }
            mainWebView.evaluateJavaScript(
                "window.dispatchEvent(new CustomEvent('dsh-native-browser-state',{detail:\(json)}));"
            )
        }

        #if compiler(>=6.0)
        @MainActor
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void
        ) {
            decide(webView: webView, navigationAction, decisionHandler: decisionHandler)
        }
        #else
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            decide(webView: webView, navigationAction, decisionHandler: decisionHandler)
        }
        #endif

        private func decide(
            webView: WKWebView,
            _ navigationAction: WKNavigationAction,
            decisionHandler: (WKNavigationActionPolicy) -> Void
        ) {
            guard let target = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }

            if webView === embeddedBrowser {
                if target.scheme == "http" || target.scheme == "https" || target.scheme == "about" {
                    decisionHandler(.allow)
                } else {
                    decisionHandler(.cancel)
                    NSWorkspace.shared.open(target)
                }
                return
            }

            // The right sidebar owns embedded browser frames. Keep external
            // top-level navigation outside the app, but allow subframes to
            // load their requested pages inside the Harness window.
            if navigationAction.targetFrame?.isMainFrame == false {
                decisionHandler(.allow)
                return
            }

            if target.host == "127.0.0.1" || target.host == "localhost" {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
                NSWorkspace.shared.open(target)
            }
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            if webView === embeddedBrowser { sendBrowserState() }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            if webView === embeddedBrowser { sendBrowserState() }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            if webView === embeddedBrowser { sendBrowserState(error: error.localizedDescription) }
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            if webView === embeddedBrowser { sendBrowserState(error: error.localizedDescription) }
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if webView === embeddedBrowser,
               navigationAction.targetFrame == nil {
                webView.load(navigationAction.request)
            }
            return nil
        }
    }
}
