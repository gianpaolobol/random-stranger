import React from 'react';
import {Image,View} from 'react-native';

// Display the approved lettering without the separate emblem. Keep the source intact.
const source=require('../assets/brand-approved.png');
const crop={x:640,y:140,width:1015,height:625};
export function BrandWordmark({width}:{width:number}){
 const scale=width/crop.width;
 return <View accessibilityRole="image" accessibilityLabel="Random Stranger" style={{width,height:crop.height*scale,overflow:'hidden'}}>
  <Image source={source} accessible={false} resizeMode="stretch" style={{position:'absolute',width:1752*scale,height:897*scale,left:-crop.x*scale,top:-crop.y*scale}}/>
 </View>;
}
