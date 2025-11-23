/*
å¼•ç”¨åœ°å€ https://raw.githubusercontent.com/RuCu6/Loon/main/Scripts/xiaohongshu.js
*/
// 2025-07-31 19:10

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/v1/interaction/comment/video/download")) {
  // è¯„è®ºåŒºå®žå†µç…§ç‰‡ä¿å­˜è¯·æ±‚
  let commitsCache = JSON.parse($persistentStore.read("redBookCommentLivePhoto")); // è¯»å–æŒä¹…åŒ–å­˜å‚¨
  if (commitsCache) {
    let commitsRsp = commitsCache;
    if (commitsRsp?.livePhotos?.length > 0 && obj?.data?.video) {
      for (const item of commitsRsp.livePhotos) {
        if (item?.videId === obj?.data?.video?.video_id) {
          obj.data.video.video_url = item.videoUrl;
          break;
        }
      }
    }
  }
} else if (url.includes("/v1/note/imagefeed") || url.includes("/v2/note/feed")) {
  // ä¿¡æ¯æµ å›¾ç‰‡
  let newDatas = [];
  if (obj?.data?.[0]?.note_list?.length > 0) {
    for (let item of obj.data[0].note_list) {
      if (item?.media_save_config) {
        // æ°´å°å¼€å…³
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
        item.media_save_config.disable_weibo_cover = true;
      }
      if (item?.share_info?.function_entries?.length > 0) {
        // è§†é¢‘ä¸‹è½½é™åˆ¶
        const additem = { type: "video_download" };
        // æ£€æŸ¥æ˜¯å¦å­˜åœ¨ video_download å¹¶èŽ·å–å…¶ç´¢å¼•
        let videoDownloadIndex = item.share_info.function_entries.findIndex((i) => i?.type === "video_download");
        if (videoDownloadIndex !== -1) {
          // å¦‚æžœå­˜åœ¨ï¼Œå°†å…¶ç§»åŠ¨åˆ°æ•°ç»„çš„ç¬¬ä¸€ä¸ªä½ç½®
          let videoDownloadEntry = item.share_info.function_entries.splice(videoDownloadIndex, 1)[0];
          item.share_info.function_entries.splice(0, 0, videoDownloadEntry);
        } else {
          // å¦‚æžœä¸å­˜åœ¨ï¼Œåœ¨æ•°ç»„å¼€å¤´æ·»åŠ ä¸€ä¸ªæ–°çš„ video_download å¯¹è±¡
          item.share_info.function_entries.splice(0, 0, additem);
        }
      }
      if (item?.images_list?.length > 0) {
        for (let i of item.images_list) {
          if (i.hasOwnProperty("live_photo_file_id") && i.hasOwnProperty("live_photo")) {
            if (
              i?.live_photo_file_id &&
              i?.live_photo?.media?.video_id &&
              i?.live_photo?.media?.stream?.h265?.[0]?.master_url
            ) {
              let myData = {
                file_id: i.live_photo_file_id,
                video_id: i.live_photo.media.video_id,
                url: i.live_photo.media.stream.h265[0].master_url
              };
              newDatas.push(myData);
            }
            // å†™å…¥æŒä¹…åŒ–å­˜å‚¨
            $persistentStore.write(JSON.stringify(newDatas), "redBookLivePhoto");
          }
        }
      }
    }
  }
} else if (url.includes("/v1/note/live_photo/save")) {
  // å®žå†µç…§ç‰‡ä¿å­˜è¯·æ±‚
  let livePhoto = JSON.parse($persistentStore.read("redBookLivePhoto")); // è¯»å–æŒä¹…åŒ–å­˜å‚¨
  if (obj?.data?.datas?.length > 0) {
    // åŽŸå§‹æ•°æ®æ²¡é—®é¢˜ äº¤æ¢urlæ•°æ®
    if (livePhoto?.length > 0) {
      obj.data.datas.forEach((itemA) => {
        livePhoto.forEach((itemB) => {
          if (itemB?.file_id === itemA?.file_id && itemA?.url) {
            itemA.url = itemA.url.replace(/^https?:\/\/.*\.mp4/g, itemB.url);
          }
        });
      });
    }
  } else {
    // åŽŸå§‹æ•°æ®æœ‰é—®é¢˜ å¼ºåˆ¶è¿”å›žæˆåŠŸå“åº”
    obj = { code: 0, success: true, msg: "æˆåŠŸ", data: { datas: livePhoto } };
  }
} else if (url.includes("/v1/system/service/ui/config")) {
  // æ•´ä½“ ui é…ç½®
  if (obj?.data?.sideConfigHomepage?.componentConfig?.sidebar_config_cny_2025) {
    obj.data.sideConfigHomepage.componentConfig.sidebar_config_cny_2025 = {};
  }
  if (obj?.data?.sideConfigPersonalPage?.componentConfig?.sidebar_config_cny_2025) {
    obj.data.sideConfigPersonalPage.componentConfig.sidebar_config_cny_2025 = {};
  }
} else if (url.includes("/v1/system_service/config")) {
  // æ•´ä½“é…ç½®
  const item = ["app_theme", "loading_img", "splash", "store"];
  if (obj?.data) {
    for (let i of item) {
      delete obj.data[i];
    }
  }
} else if (url.includes("/v2/note/widgets")) {
  // è¯¦æƒ…é¡µå°éƒ¨ä»¶
  const item = ["cooperate_binds", "generic", "note_next_step", "widgets_nbb", "widgets_ncb", "widgets_ndb"];
  // cooperate_bindsåˆä½œå“ç‰Œ note_next_stepæ´»åŠ¨ widgets_nbbç›¸å…³æœç´¢
  if (obj?.data) {
    for (let i of item) {
      delete obj.data[i];
    }
  }
} else if (url.includes("/v2/system_service/splash_config")) {
  // å¼€å±å¹¿å‘Š
  if (obj?.data?.ads_groups?.length > 0) {
    for (let i of obj.data.ads_groups) {
      i.start_time = 3818332800; // Unix æ—¶é—´æˆ³ 2090-12-31 00:00:00
      i.end_time = 3818419199; // Unix æ—¶é—´æˆ³ 2090-12-31 23:59:59
      if (i?.ads?.length > 0) {
        for (let ii of i.ads) {
          ii.start_time = 3818332800; // Unix æ—¶é—´æˆ³ 2090-12-31 00:00:00
          ii.end_time = 3818419199; // Unix æ—¶é—´æˆ³ 2090-12-31 23:59:59
        }
      }
    }
  }
} else if (url.includes("/v2/user/followings/followfeed")) {
  // å…³æ³¨é¡µä¿¡æ¯æµ å¯èƒ½æ„Ÿå…´è¶£çš„äºº
  if (obj?.data?.items?.length > 0) {
    // ç™½åå•
    obj.data.items = obj.data.items.filter((i) => i?.recommend_reason === "friend_post");
  }
} else if (url.includes("/v3/note/videofeed")) {
  // ä¿¡æ¯æµ è§†é¢‘
  if (obj?.data?.length > 0) {
    for (let item of obj.data) {
      if (item?.media_save_config) {
        // æ°´å°å¼€å…³
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
        item.media_save_config.disable_weibo_cover = true;
      }
      if (item?.share_info?.function_entries?.length > 0) {
        // è§†é¢‘ä¸‹è½½é™åˆ¶
        const additem = { type: "video_download" };
        // æ£€æŸ¥æ˜¯å¦å­˜åœ¨ video_download å¹¶èŽ·å–å…¶ç´¢å¼•
        let videoDownloadIndex = item.share_info.function_entries.findIndex((i) => i?.type === "video_download");
        if (videoDownloadIndex !== -1) {
          // å¦‚æžœå­˜åœ¨ï¼Œå°†å…¶ç§»åŠ¨åˆ°æ•°ç»„çš„ç¬¬ä¸€ä¸ªä½ç½®
          let videoDownloadEntry = item.share_info.function_entries.splice(videoDownloadIndex, 1)[0];
          item.share_info.function_entries.splice(0, 0, videoDownloadEntry);
        } else {
          // å¦‚æžœä¸å­˜åœ¨ï¼Œåœ¨æ•°ç»„å¼€å¤´æ·»åŠ ä¸€ä¸ªæ–°çš„ video_download å¯¹è±¡
          item.share_info.function_entries.splice(0, 0, additem);
        }
      }
    }
  }
} else if (url.includes("/v4/followfeed")) {
  // å…³æ³¨åˆ—è¡¨
  if (obj?.data?.items?.length > 0) {
    // recommend_userå¯èƒ½æ„Ÿå…´è¶£çš„äºº
    obj.data.items = obj.data.items.filter((i) => !["recommend_user"]?.includes(i?.recommend_reason));
  }
} else if (url.includes("/v4/note/videofeed")) {
  // ä¿¡æ¯æµ è§†é¢‘
  let modDatas = [];
  let newDatas = [];
  let unlockDatas = [];
  if (obj?.data?.length > 0) {
    for (let item of obj.data) {
      if (item?.model_type === "note") {
        if (item?.id && item?.video_info_v2?.media?.stream?.h265?.[0]?.master_url) {
          let myData = {
            id: item.id,
            url: item.video_info_v2.media.stream.h265[0].master_url
          };
          newDatas.push(myData);
        }
        if (item?.share_info?.function_entries?.length > 0) {
          // è§†é¢‘ä¸‹è½½é™åˆ¶
          const additem = { type: "video_download" };
          // æ£€æŸ¥æ˜¯å¦å­˜åœ¨ video_download å¹¶èŽ·å–å…¶ç´¢å¼•
          let videoDownloadIndex = item.share_info.function_entries.findIndex((i) => i?.type === "video_download");
          if (videoDownloadIndex !== -1) {
            // å¦‚æžœå­˜åœ¨ï¼Œå°†å…¶ç§»åŠ¨åˆ°æ•°ç»„çš„ç¬¬ä¸€ä¸ªä½ç½®
            let videoDownloadEntry = item.share_info.function_entries.splice(videoDownloadIndex, 1)[0];
            item.share_info.function_entries.splice(0, 0, videoDownloadEntry);
          } else {
            // å¦‚æžœä¸å­˜åœ¨ï¼Œåœ¨æ•°ç»„å¼€å¤´æ·»åŠ ä¸€ä¸ªæ–°çš„ video_download å¯¹è±¡
            item.share_info.function_entries.splice(0, 0, additem);
          }
        }
        if (item.hasOwnProperty("ad")) {
          continue;
        } else {
          modDatas.push(item);
        }
      } else {
        continue;
      }
      obj.data = modDatas;
    }
    $persistentStore.write(JSON.stringify(newDatas), "redBookVideoFeed"); // æ™®é€šè§†é¢‘ å†™å…¥æŒä¹…åŒ–å­˜å‚¨
  }
  let videoFeedUnlock = JSON.parse($persistentStore.read("redBookVideoFeedUnlock")); // ç¦æ­¢ä¿å­˜çš„è§†é¢‘ è¯»å–æŒä¹…åŒ–å­˜å‚¨
  if (videoFeedUnlock?.gayhub === "rucu6") {
    if (obj?.data?.length > 0) {
      for (let item of obj.data) {
        if (item?.id && item?.video_info_v2?.media?.stream?.h265?.[0]?.master_url) {
          let myData = {
            id: item.id,
            url: item.video_info_v2.media.stream.h265[0].master_url
          };
          unlockDatas.push(myData);
        }
      }
    }
    $persistentStore.write(JSON.stringify(unlockDatas), "redBookVideoFeedUnlock"); // ç¦æ­¢ä¿å­˜çš„è§†é¢‘ å†™å…¥æŒä¹…åŒ–å­˜å‚¨
  }
} else if (url.includes("/v5/note/comment/list")) {
  // å¤„ç†è¯„è®ºåŒºå®žå†µç…§ç‰‡
  replaceRedIdWithFmz200(obj.data);
  let livePhotos = [];
  let note_id = "";
  if (obj?.data?.comments?.length > 0) {
    note_id = obj.data.comments[0].note_id;
    for (const comment of obj.data.comments) {
      // comment_type: 0-æ–‡å­—ï¼Œ2-å›¾ç‰‡/liveï¼Œ3-è¡¨æƒ…åŒ…
      if (comment?.comment_type === 3) {
        comment.comment_type = 2;
      }
      if (comment?.media_source_type === 1) {
        comment.media_source_type = 0;
      }
      if (comment?.pictures?.length > 0) {
        for (const picture of comment.pictures) {
          if (picture?.video_id) {
            const picObj = JSON.parse(picture.video_info);
            if (picObj?.stream?.h265?.[0]?.master_url) {
              const videoData = {
                videId: picture.video_id,
                videoUrl: picObj.stream.h265[0].master_url
              };
              livePhotos.push(videoData);
            }
          }
        }
      }
      if (comment?.sub_comments?.length > 0) {
        for (const sub_comment of comment.sub_comments) {
          if (comment?.comment_type === 3) {
            comment.comment_type = 2;
          }
          if (comment?.media_source_type === 1) {
            comment.media_source_type = 0;
          }
          if (sub_comment?.pictures?.length > 0) {
            for (const picture of sub_comment.pictures) {
              if (picture?.video_id) {
                const picObj = JSON.parse(picture.video_info);
                if (picObj?.stream?.h265?.[0]?.master_url) {
                  const videoData = {
                    videId: picture.video_id,
                    videoUrl: picObj.stream.h265[0].master_url
                  };
                  livePhotos.push(videoData);
                }
              }
            }
          }
        }
      }
    }
  }
  if (livePhotos?.length > 0) {
    let commitsRsp;
    let commitsCache = JSON.parse($persistentStore.read("redBookCommentLivePhoto")); // è¯»å–æŒä¹…åŒ–å­˜å‚¨
    if (!commitsCache) {
      commitsRsp = { noteId: note_id, livePhotos: livePhotos };
    } else {
      commitsRsp = commitsCache;
      if (commitsRsp?.noteId === note_id) {
        commitsRsp.livePhotos = deduplicateLivePhotos(commitsRsp.livePhotos.concat(livePhotos));
      } else {
        commitsRsp = { noteId: note_id, livePhotos: livePhotos };
      }
    }
    $persistentStore.write(JSON.stringify(commitsRsp), "redBookCommentLivePhoto"); // è¯„è®ºåŒºå®žå†µç…§ç‰‡ å†™å…¥æŒä¹…åŒ–å­˜å‚¨
  }
} else if (url.includes("/v5/recommend/user/follow_recommend")) {
  // ç”¨æˆ·è¯¦æƒ…é¡µ ä½ å¯èƒ½æ„Ÿå…´è¶£çš„äºº
  if (obj?.data?.title === "ä½ å¯èƒ½æ„Ÿå…´è¶£çš„äºº" && obj?.data?.rec_users?.length > 0) {
    obj.data = {};
  }
} else if (url.includes("/v6/homefeed")) {
  if (obj?.data?.length > 0) {
    // ä¿¡æ¯æµå¹¿å‘Š
    let newItems = [];
    for (let item of obj.data) {
      if (item?.model_type === "live_v2") {
        // ä¿¡æ¯æµ-ç›´æ’­
        continue;
      } else if (item.hasOwnProperty("ads_info")) {
        // ä¿¡æ¯æµ-èµžåŠ©
        continue;
      } else if (item.hasOwnProperty("card_icon")) {
        // ä¿¡æ¯æµ-å¸¦è´§
        continue;
      } else if (item.hasOwnProperty("note_attributes")) {
        // ä¿¡æ¯æµ-å¸¦è´§
        continue;
      } else if (item?.note_attributes?.includes("goods")) {
        // ä¿¡æ¯æµ-å•†å“
        continue;
      } else {
        if (item?.related_ques) {
          delete item.related_ques;
        }
        newItems.push(item);
      }
    }
    obj.data = newItems;
  }
} else if (url.includes("/v10/note/video/save")) {
  // è§†é¢‘ä¿å­˜è¯·æ±‚
  let videoFeed = JSON.parse($persistentStore.read("redBookVideoFeed")); // æ™®é€šè§†é¢‘ è¯»å–æŒä¹…åŒ–å­˜å‚¨
  let videoFeedUnlock = JSON.parse($persistentStore.read("redBookVideoFeedUnlock")); // ç¦æ­¢ä¿å­˜çš„è§†é¢‘ è¯»å–æŒä¹…åŒ–å­˜å‚¨
  if (obj?.data?.note_id && videoFeed?.length > 0) {
    for (let item of videoFeed) {
      if (item.id === obj.data.note_id) {
        obj.data.download_url = item.url;
      }
    }
  }
  if (obj?.data?.note_id && videoFeedUnlock?.length > 0) {
    if (obj?.data?.disable === true && obj?.data?.msg) {
      delete obj.data.disable;
      delete obj.data.msg;
      obj.data.download_url = "";
      obj.data.status = 2;
      for (let item of videoFeedUnlock) {
        if (item.id === obj.data.note_id) {
          obj.data.download_url = item.url;
        }
      }
    }
  }
  videoFeedUnlock = { gayhub: "rucu6" };
  $persistentStore.write(JSON.stringify(videoFeedUnlock), "redBookVideoFeedUnlock");
} else if (url.includes("/v10/search/notes")) {
  // æœç´¢ç»“æžœ
  if (obj?.data?.items?.length > 0) {
    obj.data.items = obj.data.items.filter((i) => i?.model_type === "note");
  }
} else {
  $done({});
}

$done({ body: JSON.stringify(obj) });

function deduplicateLivePhotos(livePhotos) {
  const seen = new Map();
  livePhotos = livePhotos.filter((item) => {
    if (seen.has(item.videId)) {
      return false;
    }
    seen.set(item.videId, true);
    return true;
  });
  return livePhotos;
}

function replaceRedIdWithFmz200(obj) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => replaceRedIdWithFmz200(item));
  } else if (typeof obj === "object" && obj !== null) {
    if ("red_id" in obj) {
      obj.fmz200 = obj.red_id; // åˆ›å»ºæ–°å±žæ€§fmz200
      delete obj.red_id; // åˆ é™¤æ—§å±žæ€§red_id
    }
    Object.keys(obj).forEach((key) => {
      replaceRedIdWithFmz200(obj[key]);
    });
  }
}
