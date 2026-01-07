//
//  AudioSessionManagerBridge.h
//  domismusic
//
//  Created by Domis Blue on 10/31/25.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>

@interface RCT_EXTERN_MODULE(AudioSessionManager, NSObject)
RCT_EXTERN_METHOD(disableAGC)
@end
