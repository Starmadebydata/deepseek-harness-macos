import Testing
@testable import DeepSeekHarness

@Test func readyStateReportsReadiness() {
    #expect(HarnessState.ready(ownsServer: true).isReady)
    #expect(HarnessState.ready(ownsServer: false).isReady)
    #expect(!HarnessState.launching.isReady)
}

@Test func statusDistinguishesOwnedAndExistingServers() {
    #expect(HarnessState.ready(ownsServer: true).statusText.contains("本应用启动"))
    #expect(HarnessState.ready(ownsServer: false).statusText.contains("正在运行"))
}
