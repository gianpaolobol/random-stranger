const {withInfoPlist,withEntitlementsPlist}=require('expo/config-plugins');
module.exports=function withMinimalPermissions(config,{demoOnly=false}={}){
 config=withInfoPlist(config,result=>{
  if(process.env.EAS_BUILD_PROFILE!=='development')for(const key of ['NSLocationAlwaysAndWhenInUseUsageDescription','NSLocationAlwaysUsageDescription','NSLocationTemporaryUsageDescriptionDictionary','NSMotionUsageDescription','NSFaceIDUsageDescription','NSLocalNetworkUsageDescription'])delete result.modResults[key];
  // Keep SDK purpose strings even in demo binaries: Apple scans linked APIs.
  // Their presence does not request access; demo runtime still disables real APIs.
  return result;
 });
 // Expo applies installed legacy plugins even when omitted from the plugins array.
 // Declare this plugin first: Expo executes mod callbacks in reverse declaration order.
 return withEntitlementsPlist(config,result=>{
  if(demoOnly)delete result.modResults['com.apple.developer.applesignin'];
  return result;
 });
};
