require 'xcodeproj'
%w[RS_PROFILE_UUID APPLE_TEAM_ID].each { |key| abort "Missing #{key}" if ENV[key].to_s.empty? }
project = Xcodeproj::Project.open('ios/RandomStranger.xcodeproj')
target = project.targets.find { |item| item.name == 'RandomStranger' }
abort 'Main iOS target not found' unless target
# Only the app target receives the provisioning profile; Pods stay unchanged.
target.build_configurations.each do |configuration|
 next unless configuration.name == 'Release'
 configuration.build_settings['CODE_SIGN_STYLE'] = 'Manual'
 configuration.build_settings['DEVELOPMENT_TEAM'] = ENV.fetch('APPLE_TEAM_ID')
 configuration.build_settings['CODE_SIGN_IDENTITY'] = 'Apple Distribution'
 configuration.build_settings['PROVISIONING_PROFILE_SPECIFIER'] = ENV.fetch('RS_PROFILE_UUID')
end
project.save
