import {githubBuildNumber} from '../../src/ci-build.mjs';
console.log('CI_BUILD_NUMBER='+githubBuildNumber(process.env.GITHUB_RUN_NUMBER,process.env.GITHUB_RUN_ATTEMPT));
