import SwiftUI

struct ContentView: View {
    let harness: HarnessService

    var body: some View {
        ZStack {
            if harness.state.isReady {
                HarnessWebView(url: HarnessService.serverURL, reloadToken: harness.reloadToken)
            } else {
                LaunchView(state: harness.state, log: harness.recentLog) {
                    Task { await harness.restart() }
                }
            }
        }
        .background(.background)
    }
}
