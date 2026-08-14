import AppKit
import SwiftUI

@main
struct DeepSeekHarnessApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var harness = HarnessService()

    var body: some Scene {
        WindowGroup("DeepSeek Harness", id: "main") {
            ContentView(harness: harness)
                .frame(minWidth: 900, minHeight: 620)
                .task {
                    appDelegate.harness = harness
                    await harness.start()
                }
        }
        .defaultSize(width: 1280, height: 820)
        .commands {
            CommandGroup(after: .appInfo) {
                Button("重新连接") {
                    Task { await harness.restart() }
                }
                .keyboardShortcut("r", modifiers: [.command, .shift])

                Button("在浏览器中打开") {
                    NSWorkspace.shared.open(HarnessService.serverURL)
                }
                .keyboardShortcut("o", modifiers: [.command, .shift])
            }
        }
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    weak var harness: HarnessService?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    func applicationWillTerminate(_ notification: Notification) {
        harness?.stopServer()
    }
}
