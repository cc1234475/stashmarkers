const { stash } = unsafeWindow.stash;

// export let STASHMARKER_API_URL = "http://localhost:7860/api/predict_1";
export let STASHMARKER_API_URL = "https://cc1234-stashtag.hf.space/api/predict_1";

export var OPTIONS = [
  "Anal",
  "Vaginal Penetration",
  "Blow Job",
  "Doggy Style",
  "Cowgirl",
  "Reverse Cowgirl",
  "Side Fuck",
  "Seashell",
  "Gape",
  "Face Fuck",
  "Fingering",
  "Kneeling",
  "Butter Churner",
  "Table Top",
  "Double Penetration",
  "Missionary",
  "Scissoring",
  "Flatiron",
  "Pussy Licking",
  "Ass Licking",
  "Ball Licking",
  "Face Sitting",
  "Hand Job",
  "Tit Job",
  "69",
  "Kissing",
  "Dildo",
  "Cumshot",
];

export function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function getScenarioAndID() {
  var result = document.URL.match(/(scenes|images)\/(\d+)/);
  var scenario = result[1];
  var scenario_id = result[2];
  return [scenario, scenario_id];
}

export async function createMarker(scene_id, primary_tag_id, seconds) {
  const reqData = {
    variables: {
      scene_id: scene_id,
      primary_tag_id: primary_tag_id,
      seconds: seconds,
    },
    query: `mutation SceneMarkerCreate($seconds: Float!, $scene_id: ID!, $primary_tag_id: ID!) {
      sceneMarkerCreate(input: {title:"", seconds: $seconds, scene_id: $scene_id, primary_tag_id: $primary_tag_id}) {
        id
      }
    }`,
  };
  let result = await stash.callGQL(reqData);
  return result.data.sceneMarkerCreate.id;
}

export async function getAllTags() {
  const reqData = {
    query: `{
      allTags{
        id
        name
        aliases
      }
    }`,
  };
  var result = await stash.callGQL(reqData);
  return result.data.allTags.reduce((map, obj) => {
    map[obj.name] = obj.id;
    obj.aliases.forEach((alias) => {
      map[alias] = obj.id;
    });
    return map;
  }, {});
}

export function getUrlSprite() {
  let hash = document.querySelector(
    "div.fade.file-info-panel.tab-pane > div > dl > dd:nth-child(2) > div"
  ).innerHTML;
  let url =
    window.location.protocol +
    "//" +
    window.location.host +
    "/scene/" +
    hash +
    "_sprite.jpg";
  return url;
}
