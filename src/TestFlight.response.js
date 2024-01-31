/*
README: https://github.com/VirgilClyne/iRingo
*/

import ENVs from "./ENV/ENV.mjs";
import URIs from "./URI/URI.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENVs(" iRingo: ✈ TestFlight v3.1.1(3) response");
const URI = new URIs();

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ ${$.name}`, `URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ ${$.name}`, `FORMAT: ${FORMAT}`, "");
(async () => {
	const { Settings, Caches, Configs } = setENV($, "iRingo", "TestFlight", Database);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 格式判断
			switch (FORMAT) {
				case undefined: // 视为无body
					break;
				case "application/x-www-form-urlencoded":
				case "text/plain":
				case "text/html":
				default:
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					break;
				case "text/xml":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					break;
				case "text/vtt":
				case "application/vtt":
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					// 主机判断
					switch (HOST) {
						case "testflight.apple.com":
							// 路径判断
							switch (PATH) {
								case "v1/session/authenticate":
									switch (Settings.MultiAccount) { // MultiAccount
										case true:
											$.log(`⚠ ${$.name}, 启用多账号支持`, "");
											const XRequestId = $request?.headers?.["X-Request-Id"] ?? $request?.headers?.["x-request-id"];
											const XSessionId = $request?.headers?.["X-Session-Id"] ?? $request?.headers?.["x-session-id"];
											const XSessionDigest = $request?.headers?.["X-Session-Digest"] ?? $request?.headers?.["x-session-digest"];
											if (Caches?.data) { //有data
												$.log(`⚠ ${$.name}, 有Caches.data`, "");
												if (body?.data?.accountId === Caches?.data?.accountId) { // Account ID相等，刷新缓存
													$.log(`⚠ ${$.name}, Account ID相等，刷新缓存`, "");
													Caches.headers = {
														"X-Request-Id": XRequestId,
														"X-Session-Id": XSessionId,
														"X-Session-Digest": XSessionDigest
													};
													Caches.data = body.data;
													Caches.data.termsAndConditions = null;
													Caches.data.hasNewTermsAndConditions = false;
													$.setjson(Caches, "@iRingo.TestFlight.Caches");
												}
											} else { // Caches空
												$.log(`⚠ ${$.name}, Caches空，写入`, "");
												Caches.headers = {
													"X-Request-Id": XRequestId,
													"X-Session-Id": XSessionId,
													"X-Session-Digest": XSessionDigest
												};
												Caches.data = body.data;
												Caches.data.termsAndConditions = null;
												Caches.data.hasNewTermsAndConditions = false;
												$.setjson(Caches, "@iRingo.TestFlight.Caches");
											};
											break;
										case false:
										default:
											break;
									};
									break;
								case "v1/devices":
								case "v1/devices/apns":
								case "v1/devices/add":
								case "v1/devices/remove":
									break;
								default:
									switch (PATHs[0]) {
										case "v1":
										case "v2":
										case "v3":
											switch (PATHs[1]) {
												case "accounts":
													switch (PATHs[2]) {
														case "settings":
															switch (PATHs[3]) {
																case undefined:
																	break;
																case "notifications":
																	switch (PATHs[4]) {
																		case "apps":
																			break;
																	};
																	break;
																default:
																	break;
															};
															break;
														case Caches?.data?.accountId: // UUID
														default:
															switch (PATHs[3]) {
																case undefined:
																	break;
																case "apps":
																	switch (PATHs[4]) {
																		case undefined:
																			$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps`, "");
																			switch (Settings.Universal) { // 通用
																				case true:
																					$.log(`🚧 ${$.name}, 启用通用应用支持`, "");
																					if (body.error === null) { // 数据无错误
																						$.log(`🚧 ${$.name}, 数据无错误`, "");
																						body.data = body.data.map(app => {
																							if (app.previouslyTested !== false) { // 不是前测试人员
																								$.log(`🚧 ${$.name}, 不是前测试人员`, "");
																								app.platforms = app.platforms.map(platform => {
																									platform.build = modBuild(platform.build);
																									return platform
																								});
																							}
																							return app
																						});
																					};
																					break;
																				case false:
																				default:
																					break;
																			};
																			break;
																		default:
																			switch (PATHs[5]) {
																				case undefined:
																					break;
																				case "builds":
																					switch (PATHs[7]) {
																						case undefined:
																							$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}`, "");
																							switch (Settings.Universal) { // 通用
																								case true:
																									$.log(`🚧 ${$.name}, 启用通用应用支持`, "");
																									if (body.error === null) { // 数据无错误
																										$.log(`🚧 ${$.name}, 数据无错误`, "");
																										// 当前Bulid
																										body.data.currentBuild = modBuild(body.data.currentBuild);
																										// Build列表
																										body.data.builds = body.data.builds.map(build => modBuild(build));
																									};
																									break;
																								case false:
																								default:
																									break;
																							};
																							break;
																						case "install":
																							break;
																						default:
																							break;
																					};
																					break;
																				case "platforms":
																					switch (PATHs[6]) {
																						case "ios":
																						case "osx":
																						case "appletvos":
																						default:
																							switch (PATHs[7]) {
																								case undefined:
																									break;
																								case "trains":
																									switch (PATHs[9]) {
																										case undefined:
																											break;
																										case "builds":
																											switch (PATHs[10]) {
																												case undefined:
																													$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}/builds`, "");
																													switch (Settings.Universal) { // 通用
																														case true:
																															$.log(`🚧 ${$.name}, 启用通用应用支持`, "");
																															if (body.error === null) { // 数据无错误
																																$.log(`🚧 ${$.name}, 数据无错误`, "");
																																// 当前Bulid
																																body.data = body.data.map(data => modBuild(data));
																															};
																															break;
																														case false:
																														default:
																															break;
																													};
																													break;
																												default:
																													break;
																											};
																											break;
																										default:
																											break;
																									};
																									break;
																								default:
																									break;
																							};
																							break;
																					};
																					break;
																				default:
																					break;
																			};
																			break;
																	};
																	break;
																default:
																	break;
															};
															break;
													};
													break;
												case "apps":
													switch (PATHs[3]) {
														case "install":
															switch (PATHs[4]) {
																case undefined:
																	break;
																case "status":
																	break;
																default:
																	break;
															};
															break;
													};
													break;
												case "messages":
													switch (PATHs[2]) {
														case Caches?.data?.accountId: // UUID
														default:
															switch (PATHs[3]) {
																case undefined:
																	break;
																case "read":
																	break;
																default:
																	break;
															};
															break;
													};
													break;
											};
											break;
									};
									break;
							};
							break;
					};
					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "applecation/octet-stream":
					break;
			};
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: { // 有回复数据，返回回复数据
				$.log(`🎉 ${$.name}, finally`, `$response`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `$response: ${JSON.stringify($response)}`, "");
				if ($response?.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response?.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
					switch (FORMAT) {
						case undefined: // 视为无body
							// 返回普通数据
							$.done({ status: $response.status, headers: $response.headers });
							break;
						default:
							// 返回普通数据
							$.done({ status: $response.status, headers: $response.headers, body: $response.body });
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							// 返回二进制数据
							//$.log(`${$response.bodyBytes.byteLength}---${$response.bodyBytes.buffer.byteLength}`);
							$.done({ status: $response.status, headers: $response.headers, bodyBytes: $response.bodyBytes.buffer.slice($response.bodyBytes.byteOffset, $response.bodyBytes.byteLength + $response.bodyBytes.byteOffset) });
							break;
					};
				} else $.done($response);
				break;
			};
			case undefined: { // 无回复数据
				break;
			};
		};
	})

/***************** Function *****************/
/**
 * mod Build
 * @author VirgilClyne
 * @param {Object} build - Build
 * @return {Object}
 */
function modBuild(build) {
	switch (build.platform || build.name) {
		case "ios":
			$.log(`🚧 ${$.name}, ios`, "");
			build = Build(build);
			break;
		case "osx":
			$.log(`🚧 ${$.name}, osx`, "");
			if (build?.macBuildCompatibility?.runsOnAppleSilicon === true) { // 是苹果芯片
				$.log(`🚧 ${$.name}, runsOnAppleSilicon`, "");
				build = Build(build);
			};
			break;
		case "appletvos":
			$.log(`🚧 ${$.name}, appletvos`, "");
			break;
		default:
			$.log(`🚧 ${$.name}, unknown platform: ${build.platform || build.name}`, "");
			break;
	};
	return build

	function Build(build) {
		//if (build.universal === true) {
			build.compatible = true;
			build.platformCompatible = true;
			build.hardwareCompatible = true;
			build.osCompatible = true;
			if (build?.permission) build.permission = "install";
			if (build?.deviceFamilyInfo) {
				build.deviceFamilyInfo = [
					{
						"number": 1,
						"name": "iOS",
						"iconUrl": "https://itunesconnect-mr.itunes.apple.com/itc/img/device-icons/device_family_icon_1.png"
					},
					{
						"number": 2,
						"name": "iPad",
						"iconUrl": "https://itunesconnect-mr.itunes.apple.com/itc/img/device-icons/device_family_icon_2.png"
					},
					{
						"number": 3,
						"name": "Apple TV",
						"iconUrl": "https://itunesconnect-mr.itunes.apple.com/itc/img/device-icons/device_family_icon_3.png"
					}
				];
			};
			if (build?.compatibilityData?.compatibleDeviceFamilies) {
				build.compatibilityData.compatibleDeviceFamilies = [
					{
						"name": "iPad",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					},
					{
						"name": "iPhone",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					},
					{
						"name": "iPod",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					},
					{
						"name": "Mac",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					}
				];
			};
			if (build.macBuildCompatibility) {
				build.macBuildCompatibility.runsOnIntel = true;
				build.macBuildCompatibility.runsOnAppleSilicon = true;
				/*
				build.macBuildCompatibility = {
					"macArchitectures": ["AppleSilicon", "Intel"],
					"rosettaCompatible": true,
					"runsOnIntel": true,
					"runsOnAppleSilicon": true,
					"requiresRosetta": false
				};
				*/
			};
		//};
		return build
	};
};
