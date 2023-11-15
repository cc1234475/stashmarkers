const { stash } = unsafeWindow.stash;

export let STASHMARKER_API_URL = "_STASHMARKER_API_URL";

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

/**
 * Returns an array with the scenario and scenario ID parsed from the current URL.
 * @returns {Array<string>} An array with the scenario and scenario ID.
 */
export function getScenarioAndID() {
  var result = document.URL.match(/(scenes|images)\/(\d+)/);
  var scenario = result[1];
  var scenario_id = result[2];
  return [scenario, scenario_id];
}

/**
 * Creates a new tag with the given name.
 * @param {string} tag_name - The name of the tag to create.
 * @returns {Promise<string>} - A Promise that resolves with the ID of the newly created tag.
 */
export async function createTag(tag_name) {
  const reqData = {
    variables: { input: {name: tag_name} },
    query: `mutation tagCreate($input: TagCreateInput!) {
      tagCreate(input: $input){
            id
        }
      }`,
  };
  let result = await stash.callGQL(reqData);
  return result.data.tagCreate.id;
}


/**
 * Creates a marker for a scene with the given parameters.
 * @param {string} scene_id - The ID of the scene.
 * @param {string} primary_tag_id - The ID of the primary tag.
 * @param {number} seconds - The number of seconds for the marker.
 * @returns {Promise<string>} - The ID of the created marker.
 */
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

/**
 * Retrieves all tags from the server and returns them as an object with tag names as keys and tag IDs as values.
 * @returns {Promise<Object>} An object with tag names as keys and tag IDs as values.
 */
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
    map[obj.name.toLowerCase()] = obj.id;
    obj.aliases.forEach((alias) => {
      map[alias.toLowerCase()] = obj.id;
    });
    return map;
  }, {});
}

/**
 * Retrieves the URL of the sprite for a given scene ID.
 * @param {number} scene_id - The ID of the scene to retrieve the sprite URL for.
 * @returns {Promise<string|null>} - A Promise that resolves with the sprite URL if it exists, or null if it does not.
 */
export async function getUrlSprite(scene_id) {
  const reqData = {
    query: `{
      findScene(id: ${scene_id}){
        paths{
          sprite
        }
      }
    }`,
  };
  var result = await stash.callGQL(reqData);
  const url = result.data.findScene.paths["sprite"];
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  } else {
    return result.data.findScene.paths["sprite"];
  }
}
