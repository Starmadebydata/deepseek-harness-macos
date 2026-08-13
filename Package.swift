// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "DeepSeekHarnessApp",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "DeepSeekHarness", targets: ["DeepSeekHarness"])
    ],
    targets: [
        .executableTarget(
            name: "DeepSeekHarness",
            path: "Sources/DeepSeekHarness"
        ),
        .testTarget(
            name: "DeepSeekHarnessTests",
            dependencies: ["DeepSeekHarness"],
            path: "Tests/DeepSeekHarnessTests"
        )
    ]
)
