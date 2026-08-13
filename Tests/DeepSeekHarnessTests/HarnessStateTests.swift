import XCTest
@testable import DeepSeekHarness

final class HarnessStateTests: XCTestCase {
    func testReadyStateReportsReadiness() {
        XCTAssertTrue(HarnessState.ready(ownsServer: true).isReady)
        XCTAssertTrue(HarnessState.ready(ownsServer: false).isReady)
        XCTAssertFalse(HarnessState.launching.isReady)
    }

    func testStatusDistinguishesOwnedAndExistingServers() {
        XCTAssertTrue(HarnessState.ready(ownsServer: true).statusText.contains("本应用启动"))
        XCTAssertTrue(HarnessState.ready(ownsServer: false).statusText.contains("正在运行"))
    }
}
