import SwiftUI

struct LaunchView: View {
    let state: HarnessState
    let log: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 22) {
            Image(systemName: state.isReady ? "checkmark.circle.fill" : "sparkles.rectangle.stack")
                .font(.system(size: 54, weight: .medium))
                .foregroundStyle(state.isReady ? .green : .blue)

            VStack(spacing: 8) {
                Text("DeepSeek Harness")
                    .font(.largeTitle.weight(.semibold))
                Text(state.statusText)
                    .font(.title3)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            if case .connecting = state {
                ProgressView()
                    .controlSize(.large)
            } else if case .launching = state {
                ProgressView()
                    .controlSize(.large)
            } else if case .failed = state {
                Button("重新连接", action: retry)
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)

                if !log.isEmpty {
                    ScrollView {
                        Text(log)
                            .font(.system(.caption, design: .monospaced))
                            .textSelection(.enabled)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                    }
                    .frame(maxWidth: 620, maxHeight: 180)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .padding(48)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
