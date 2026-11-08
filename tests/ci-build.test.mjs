import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeBuildVersion} from '../src/ci-build.mjs';
test('local config preserves native version defaults',()=>assert.deepEqual(nativeBuildVersion({}),{}));
test('CI applies one valid version to iOS and Android',()=>assert.deepEqual(nativeBuildVersion({CI_BUILD_NUMBER:'5011'}),{iosBuildNumber:'5011',androidVersionCode:5011}));
test('invalid or reused native numbers fail closed',()=>{
 for(const value of ['0','3','1.2','-4','nan','2147483648',' 5011','5;echo'])assert.throws(()=>nativeBuildVersion({CI_BUILD_NUMBER:value}),/CI_BUILD_NUMBER/);
});
test('GitHub retries never overlap the next run',async()=>{
 const {githubBuildNumber}=await import('../src/ci-build.mjs');
 assert.ok(githubBuildNumber('1','999')<githubBuildNumber('2','1'));
 assert.ok(githubBuildNumber('2','2')>githubBuildNumber('2','1'));
 for(const pair of [['1','1000'],['0','1'],['1','0'],['-1','2'],['2147483647','1']])assert.throws(()=>githubBuildNumber(...pair));
});
