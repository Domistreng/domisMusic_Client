//
//  AudioSessionManager.swift
//  domismusic
//
//  Created by Domis Blue on 10/31/25.
//

import Foundation
import AVFoundation
import React

@objc(AudioSessionManager)
class AudioSessionManager: NSObject {

  @objc
  func disableAGC() -> Void {
    let session = AVAudioSession.sharedInstance()

    do {
      try session.setCategory(.playAndRecord, options: [.mixWithOthers])
      try session.setMode(.measurement)  // Disables AGC
      try session.setActive(true)
      print("AudioSession configured: AGC disabled")
    } catch {
      print("Failed to configure AVAudioSession: \(error)")
    }
  }

  // Required to export this module to React Native
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
