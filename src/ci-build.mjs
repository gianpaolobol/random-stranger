// Values are public build metadata, never signing credentials.
export function nativeBuildVersion(env){
 const value=env.CI_BUILD_NUMBER;
 if(value===undefined)return {};
 if(!/^[1-9]\d*$/.test(value)||Number(value)<4||Number(value)>2147483647)throw Error('CI_BUILD_NUMBER must be an integer from 4 to 2147483647');
 return {iosBuildNumber:value,androidVersionCode:Number(value)};
}
export function githubBuildNumber(run,attempt){
 if(!/^[1-9]\d*$/.test(run)||!/^[1-9]\d*$/.test(attempt)||Number(attempt)>999)throw Error('Invalid GitHub run or attempt');
 const number=5000+Number(run)*1000+Number(attempt);
 nativeBuildVersion({CI_BUILD_NUMBER:String(number)});
 return number;
}
