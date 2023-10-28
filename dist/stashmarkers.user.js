// ==UserScript==
// @name        stashmarkers
// @description Generate markers for a scene
// @namespace   https://github.com/cc1234475
// @version     0.1.2
// @homepage    https://github.com/cc1234475
// @author      cc12344567
// @resource    css https://raw.githubusercontent.com/cc1234475/stashmarkers/main/dist/bundle.css
// @match       http://localhost:9999/*
// @connect     hf.space
// @connect     localhost
// @run-at      document-idle
// @require     https://raw.githubusercontent.com/7dJx1qP/stash-userscripts/master/src/StashUserscriptLibrary.js
// @downloadURL https://raw.githubusercontent.com/cc1234475/stashmarkers/main/dist/stashmarkers.user.js
// @updateURL   https://raw.githubusercontent.com/cc1234475/stashmarkers/main/dist/stashmarkers.user.js
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==
GM_addStyle(GM_getResourceText('css'));
(function () {
  'use strict';

  const { stash: stash$1 } = unsafeWindow.stash;

  // export let STASHMARKER_API_URL = "http://localhost:7860/api/predict_1";
  let STASHMARKER_API_URL = "https://cc1234-stashtag.hf.space/api/predict_1";

  var OPTIONS = [
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

  function waitForElm(selector) {
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

  function getScenarioAndID() {
    var result = document.URL.match(/(scenes|images)\/(\d+)/);
    var scenario = result[1];
    var scenario_id = result[2];
    return [scenario, scenario_id];
  }

  async function createMarker(scene_id, primary_tag_id, seconds) {
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
    let result = await stash$1.callGQL(reqData);
    return result.data.sceneMarkerCreate.id;
  }

  async function getAllTags() {
    const reqData = {
      query: `{
      allTags{
        id
        name
        aliases
      }
    }`,
    };
    var result = await stash$1.callGQL(reqData);
    return result.data.allTags.reduce((map, obj) => {
      map[obj.name] = obj.id;
      obj.aliases.forEach((alias) => {
        map[alias] = obj.id;
      });
      return map;
    }, {});
  }

  async function getUrlSprite(scene_id) {
    const reqData = {
      query: `{
      findScene(id: ${scene_id}){
        paths{
          sprite
        }
      }
    }`,
    };
    var result = await stash$1.callGQL(reqData);
    const url = result.data.findScene.paths["sprite"];
    const response = await fetch(url);
    if (response.status === 404) {
      return null;
    } else {
      return result.data.findScene.paths["sprite"];
    }
  }

  function noop() { }
  const identity = x => x;
  function run(fn) {
      return fn();
  }
  function blank_object() {
      return Object.create(null);
  }
  function run_all(fns) {
      fns.forEach(run);
  }
  function is_function(thing) {
      return typeof thing === 'function';
  }
  function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
  }
  function is_empty(obj) {
      return Object.keys(obj).length === 0;
  }

  const is_client = typeof window !== 'undefined';
  let now = is_client
      ? () => window.performance.now()
      : () => Date.now();
  let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

  const tasks = new Set();
  function run_tasks(now) {
      tasks.forEach(task => {
          if (!task.c(now)) {
              tasks.delete(task);
              task.f();
          }
      });
      if (tasks.size !== 0)
          raf(run_tasks);
  }
  /**
   * Creates a new task that runs on each raf frame
   * until it returns a falsy value or is aborted
   */
  function loop(callback) {
      let task;
      if (tasks.size === 0)
          raf(run_tasks);
      return {
          promise: new Promise(fulfill => {
              tasks.add(task = { c: callback, f: fulfill });
          }),
          abort() {
              tasks.delete(task);
          }
      };
  }
  function append(target, node) {
      target.appendChild(node);
  }
  function get_root_for_style(node) {
      if (!node)
          return document;
      const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
      if (root && root.host) {
          return root;
      }
      return node.ownerDocument;
  }
  function append_empty_stylesheet(node) {
      const style_element = element('style');
      append_stylesheet(get_root_for_style(node), style_element);
      return style_element.sheet;
  }
  function append_stylesheet(node, style) {
      append(node.head || node, style);
      return style.sheet;
  }
  function insert(target, node, anchor) {
      target.insertBefore(node, anchor || null);
  }
  function detach(node) {
      if (node.parentNode) {
          node.parentNode.removeChild(node);
      }
  }
  function destroy_each(iterations, detaching) {
      for (let i = 0; i < iterations.length; i += 1) {
          if (iterations[i])
              iterations[i].d(detaching);
      }
  }
  function element(name) {
      return document.createElement(name);
  }
  function svg_element(name) {
      return document.createElementNS('http://www.w3.org/2000/svg', name);
  }
  function text(data) {
      return document.createTextNode(data);
  }
  function space() {
      return text(' ');
  }
  function listen(node, event, handler, options) {
      node.addEventListener(event, handler, options);
      return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
      if (value == null)
          node.removeAttribute(attribute);
      else if (node.getAttribute(attribute) !== value)
          node.setAttribute(attribute, value);
  }
  function to_number(value) {
      return value === '' ? null : +value;
  }
  function children(element) {
      return Array.from(element.childNodes);
  }
  function set_data(text, data) {
      data = '' + data;
      if (text.data === data)
          return;
      text.data = data;
  }
  function set_input_value(input, value) {
      input.value = value == null ? '' : value;
  }
  function set_style(node, key, value, important) {
      if (value == null) {
          node.style.removeProperty(key);
      }
      else {
          node.style.setProperty(key, value, important ? 'important' : '');
      }
  }
  function select_option(select, value, mounting) {
      for (let i = 0; i < select.options.length; i += 1) {
          const option = select.options[i];
          if (option.__value === value) {
              option.selected = true;
              return;
          }
      }
      if (!mounting || value !== undefined) {
          select.selectedIndex = -1; // no option should be selected
      }
  }
  function select_value(select) {
      const selected_option = select.querySelector(':checked');
      return selected_option && selected_option.__value;
  }
  function toggle_class(element, name, toggle) {
      element.classList[toggle ? 'add' : 'remove'](name);
  }
  function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
      const e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, bubbles, cancelable, detail);
      return e;
  }

  // we need to store the information for multiple documents because a Svelte application could also contain iframes
  // https://github.com/sveltejs/svelte/issues/3624
  const managed_styles = new Map();
  let active = 0;
  // https://github.com/darkskyapp/string-hash/blob/master/index.js
  function hash(str) {
      let hash = 5381;
      let i = str.length;
      while (i--)
          hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
      return hash >>> 0;
  }
  function create_style_information(doc, node) {
      const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
      managed_styles.set(doc, info);
      return info;
  }
  function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
      const step = 16.666 / duration;
      let keyframes = '{\n';
      for (let p = 0; p <= 1; p += step) {
          const t = a + (b - a) * ease(p);
          keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
      }
      const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
      const name = `__svelte_${hash(rule)}_${uid}`;
      const doc = get_root_for_style(node);
      const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
      if (!rules[name]) {
          rules[name] = true;
          stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
      }
      const animation = node.style.animation || '';
      node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
      active += 1;
      return name;
  }
  function delete_rule(node, name) {
      const previous = (node.style.animation || '').split(', ');
      const next = previous.filter(name
          ? anim => anim.indexOf(name) < 0 // remove specific animation
          : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
      );
      const deleted = previous.length - next.length;
      if (deleted) {
          node.style.animation = next.join(', ');
          active -= deleted;
          if (!active)
              clear_rules();
      }
  }
  function clear_rules() {
      raf(() => {
          if (active)
              return;
          managed_styles.forEach(info => {
              const { ownerNode } = info.stylesheet;
              // there is no ownerNode if it runs on jsdom.
              if (ownerNode)
                  detach(ownerNode);
          });
          managed_styles.clear();
      });
  }

  function create_animation(node, from, fn, params) {
      if (!from)
          return noop;
      const to = node.getBoundingClientRect();
      if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
          return noop;
      const { delay = 0, duration = 300, easing = identity, 
      // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
      start: start_time = now() + delay, 
      // @ts-ignore todo:
      end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
      let running = true;
      let started = false;
      let name;
      function start() {
          if (css) {
              name = create_rule(node, 0, 1, duration, delay, easing, css);
          }
          if (!delay) {
              started = true;
          }
      }
      function stop() {
          if (css)
              delete_rule(node, name);
          running = false;
      }
      loop(now => {
          if (!started && now >= start_time) {
              started = true;
          }
          if (started && now >= end) {
              tick(1, 0);
              stop();
          }
          if (!running) {
              return false;
          }
          if (started) {
              const p = now - start_time;
              const t = 0 + 1 * easing(p / duration);
              tick(t, 1 - t);
          }
          return true;
      });
      start();
      tick(0, 1);
      return stop;
  }
  function fix_position(node) {
      const style = getComputedStyle(node);
      if (style.position !== 'absolute' && style.position !== 'fixed') {
          const { width, height } = style;
          const a = node.getBoundingClientRect();
          node.style.position = 'absolute';
          node.style.width = width;
          node.style.height = height;
          add_transform(node, a);
      }
  }
  function add_transform(node, a) {
      const b = node.getBoundingClientRect();
      if (a.left !== b.left || a.top !== b.top) {
          const style = getComputedStyle(node);
          const transform = style.transform === 'none' ? '' : style.transform;
          node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
      }
  }

  let current_component;
  function set_current_component(component) {
      current_component = component;
  }
  function get_current_component() {
      if (!current_component)
          throw new Error('Function called outside component initialization');
      return current_component;
  }
  /**
   * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
   * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
   * it can be called from an external module).
   *
   * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
   *
   * https://svelte.dev/docs#run-time-svelte-onmount
   */
  function onMount(fn) {
      get_current_component().$$.on_mount.push(fn);
  }

  const dirty_components = [];
  const binding_callbacks = [];
  let render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = /* @__PURE__ */ Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
      if (!update_scheduled) {
          update_scheduled = true;
          resolved_promise.then(flush);
      }
  }
  function add_render_callback(fn) {
      render_callbacks.push(fn);
  }
  // flush() calls callbacks in this order:
  // 1. All beforeUpdate callbacks, in order: parents before children
  // 2. All bind:this callbacks, in reverse order: children before parents.
  // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
  //    for afterUpdates called during the initial onMount, which are called in
  //    reverse order: children before parents.
  // Since callbacks might update component values, which could trigger another
  // call to flush(), the following steps guard against this:
  // 1. During beforeUpdate, any updated components will be added to the
  //    dirty_components array and will cause a reentrant call to flush(). Because
  //    the flush index is kept outside the function, the reentrant call will pick
  //    up where the earlier call left off and go through all dirty components. The
  //    current_component value is saved and restored so that the reentrant call will
  //    not interfere with the "parent" flush() call.
  // 2. bind:this callbacks cannot trigger new flush() calls.
  // 3. During afterUpdate, any updated components will NOT have their afterUpdate
  //    callback called a second time; the seen_callbacks set, outside the flush()
  //    function, guarantees this behavior.
  const seen_callbacks = new Set();
  let flushidx = 0; // Do *not* move this inside the flush() function
  function flush() {
      // Do not reenter flush while dirty components are updated, as this can
      // result in an infinite loop. Instead, let the inner flush handle it.
      // Reentrancy is ok afterwards for bindings etc.
      if (flushidx !== 0) {
          return;
      }
      const saved_component = current_component;
      do {
          // first, call beforeUpdate functions
          // and update components
          try {
              while (flushidx < dirty_components.length) {
                  const component = dirty_components[flushidx];
                  flushidx++;
                  set_current_component(component);
                  update(component.$$);
              }
          }
          catch (e) {
              // reset dirty state to not end up in a deadlocked state and then rethrow
              dirty_components.length = 0;
              flushidx = 0;
              throw e;
          }
          set_current_component(null);
          dirty_components.length = 0;
          flushidx = 0;
          while (binding_callbacks.length)
              binding_callbacks.pop()();
          // then, once components are updated, call
          // afterUpdate functions. This may cause
          // subsequent updates...
          for (let i = 0; i < render_callbacks.length; i += 1) {
              const callback = render_callbacks[i];
              if (!seen_callbacks.has(callback)) {
                  // ...so guard against infinite loops
                  seen_callbacks.add(callback);
                  callback();
              }
          }
          render_callbacks.length = 0;
      } while (dirty_components.length);
      while (flush_callbacks.length) {
          flush_callbacks.pop()();
      }
      update_scheduled = false;
      seen_callbacks.clear();
      set_current_component(saved_component);
  }
  function update($$) {
      if ($$.fragment !== null) {
          $$.update();
          run_all($$.before_update);
          const dirty = $$.dirty;
          $$.dirty = [-1];
          $$.fragment && $$.fragment.p($$.ctx, dirty);
          $$.after_update.forEach(add_render_callback);
      }
  }
  /**
   * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
   */
  function flush_render_callbacks(fns) {
      const filtered = [];
      const targets = [];
      render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
      targets.forEach((c) => c());
      render_callbacks = filtered;
  }

  let promise;
  function wait() {
      if (!promise) {
          promise = Promise.resolve();
          promise.then(() => {
              promise = null;
          });
      }
      return promise;
  }
  function dispatch(node, direction, kind) {
      node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
      outros = {
          r: 0,
          c: [],
          p: outros // parent group
      };
  }
  function check_outros() {
      if (!outros.r) {
          run_all(outros.c);
      }
      outros = outros.p;
  }
  function transition_in(block, local) {
      if (block && block.i) {
          outroing.delete(block);
          block.i(local);
      }
  }
  function transition_out(block, local, detach, callback) {
      if (block && block.o) {
          if (outroing.has(block))
              return;
          outroing.add(block);
          outros.c.push(() => {
              outroing.delete(block);
              if (callback) {
                  if (detach)
                      block.d(1);
                  callback();
              }
          });
          block.o(local);
      }
      else if (callback) {
          callback();
      }
  }
  const null_transition = { duration: 0 };
  function create_in_transition(node, fn, params) {
      const options = { direction: 'in' };
      let config = fn(node, params, options);
      let running = false;
      let animation_name;
      let task;
      let uid = 0;
      function cleanup() {
          if (animation_name)
              delete_rule(node, animation_name);
      }
      function go() {
          const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
          if (css)
              animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
          tick(0, 1);
          const start_time = now() + delay;
          const end_time = start_time + duration;
          if (task)
              task.abort();
          running = true;
          add_render_callback(() => dispatch(node, true, 'start'));
          task = loop(now => {
              if (running) {
                  if (now >= end_time) {
                      tick(1, 0);
                      dispatch(node, true, 'end');
                      cleanup();
                      return running = false;
                  }
                  if (now >= start_time) {
                      const t = easing((now - start_time) / duration);
                      tick(t, 1 - t);
                  }
              }
              return running;
          });
      }
      let started = false;
      return {
          start() {
              if (started)
                  return;
              started = true;
              delete_rule(node);
              if (is_function(config)) {
                  config = config(options);
                  wait().then(go);
              }
              else {
                  go();
              }
          },
          invalidate() {
              started = false;
          },
          end() {
              if (running) {
                  cleanup();
                  running = false;
              }
          }
      };
  }
  function create_out_transition(node, fn, params) {
      const options = { direction: 'out' };
      let config = fn(node, params, options);
      let running = true;
      let animation_name;
      const group = outros;
      group.r += 1;
      function go() {
          const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
          if (css)
              animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
          const start_time = now() + delay;
          const end_time = start_time + duration;
          add_render_callback(() => dispatch(node, false, 'start'));
          loop(now => {
              if (running) {
                  if (now >= end_time) {
                      tick(0, 1);
                      dispatch(node, false, 'end');
                      if (!--group.r) {
                          // this will result in `end()` being called,
                          // so we don't need to clean up here
                          run_all(group.c);
                      }
                      return false;
                  }
                  if (now >= start_time) {
                      const t = easing((now - start_time) / duration);
                      tick(1 - t, t);
                  }
              }
              return running;
          });
      }
      if (is_function(config)) {
          wait().then(() => {
              // @ts-ignore
              config = config(options);
              go();
          });
      }
      else {
          go();
      }
      return {
          end(reset) {
              if (reset && config.tick) {
                  config.tick(1, 0);
              }
              if (running) {
                  if (animation_name)
                      delete_rule(node, animation_name);
                  running = false;
              }
          }
      };
  }
  function outro_and_destroy_block(block, lookup) {
      transition_out(block, 1, 1, () => {
          lookup.delete(block.key);
      });
  }
  function fix_and_outro_and_destroy_block(block, lookup) {
      block.f();
      outro_and_destroy_block(block, lookup);
  }
  function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
      let o = old_blocks.length;
      let n = list.length;
      let i = o;
      const old_indexes = {};
      while (i--)
          old_indexes[old_blocks[i].key] = i;
      const new_blocks = [];
      const new_lookup = new Map();
      const deltas = new Map();
      const updates = [];
      i = n;
      while (i--) {
          const child_ctx = get_context(ctx, list, i);
          const key = get_key(child_ctx);
          let block = lookup.get(key);
          if (!block) {
              block = create_each_block(key, child_ctx);
              block.c();
          }
          else if (dynamic) {
              // defer updates until all the DOM shuffling is done
              updates.push(() => block.p(child_ctx, dirty));
          }
          new_lookup.set(key, new_blocks[i] = block);
          if (key in old_indexes)
              deltas.set(key, Math.abs(i - old_indexes[key]));
      }
      const will_move = new Set();
      const did_move = new Set();
      function insert(block) {
          transition_in(block, 1);
          block.m(node, next);
          lookup.set(block.key, block);
          next = block.first;
          n--;
      }
      while (o && n) {
          const new_block = new_blocks[n - 1];
          const old_block = old_blocks[o - 1];
          const new_key = new_block.key;
          const old_key = old_block.key;
          if (new_block === old_block) {
              // do nothing
              next = new_block.first;
              o--;
              n--;
          }
          else if (!new_lookup.has(old_key)) {
              // remove old block
              destroy(old_block, lookup);
              o--;
          }
          else if (!lookup.has(new_key) || will_move.has(new_key)) {
              insert(new_block);
          }
          else if (did_move.has(old_key)) {
              o--;
          }
          else if (deltas.get(new_key) > deltas.get(old_key)) {
              did_move.add(new_key);
              insert(new_block);
          }
          else {
              will_move.add(old_key);
              o--;
          }
      }
      while (o--) {
          const old_block = old_blocks[o];
          if (!new_lookup.has(old_block.key))
              destroy(old_block, lookup);
      }
      while (n)
          insert(new_blocks[n - 1]);
      run_all(updates);
      return new_blocks;
  }
  function mount_component(component, target, anchor, customElement) {
      const { fragment, after_update } = component.$$;
      fragment && fragment.m(target, anchor);
      if (!customElement) {
          // onMount happens before the initial afterUpdate
          add_render_callback(() => {
              const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
              // if the component was destroyed immediately
              // it will update the `$$.on_destroy` reference to `null`.
              // the destructured on_destroy may still reference to the old array
              if (component.$$.on_destroy) {
                  component.$$.on_destroy.push(...new_on_destroy);
              }
              else {
                  // Edge case - component was destroyed immediately,
                  // most likely as a result of a binding initialising
                  run_all(new_on_destroy);
              }
              component.$$.on_mount = [];
          });
      }
      after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
      const $$ = component.$$;
      if ($$.fragment !== null) {
          flush_render_callbacks($$.after_update);
          run_all($$.on_destroy);
          $$.fragment && $$.fragment.d(detaching);
          // TODO null out other refs, including component.$$ (but need to
          // preserve final state?)
          $$.on_destroy = $$.fragment = null;
          $$.ctx = [];
      }
  }
  function make_dirty(component, i) {
      if (component.$$.dirty[0] === -1) {
          dirty_components.push(component);
          schedule_update();
          component.$$.dirty.fill(0);
      }
      component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
  }
  function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
      const parent_component = current_component;
      set_current_component(component);
      const $$ = component.$$ = {
          fragment: null,
          ctx: [],
          // state
          props,
          update: noop,
          not_equal,
          bound: blank_object(),
          // lifecycle
          on_mount: [],
          on_destroy: [],
          on_disconnect: [],
          before_update: [],
          after_update: [],
          context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
          // everything else
          callbacks: blank_object(),
          dirty,
          skip_bound: false,
          root: options.target || parent_component.$$.root
      };
      append_styles && append_styles($$.root);
      let ready = false;
      $$.ctx = instance
          ? instance(component, options.props || {}, (i, ret, ...rest) => {
              const value = rest.length ? rest[0] : ret;
              if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                  if (!$$.skip_bound && $$.bound[i])
                      $$.bound[i](value);
                  if (ready)
                      make_dirty(component, i);
              }
              return ret;
          })
          : [];
      $$.update();
      ready = true;
      run_all($$.before_update);
      // `false` as a special case of no DOM component
      $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
      if (options.target) {
          if (options.hydrate) {
              const nodes = children(options.target);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.l(nodes);
              nodes.forEach(detach);
          }
          else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.c();
          }
          if (options.intro)
              transition_in(component.$$.fragment);
          mount_component(component, options.target, options.anchor, options.customElement);
          flush();
      }
      set_current_component(parent_component);
  }
  /**
   * Base class for Svelte components. Used when dev=false.
   */
  class SvelteComponent {
      $destroy() {
          destroy_component(this, 1);
          this.$destroy = noop;
      }
      $on(type, callback) {
          if (!is_function(callback)) {
              return noop;
          }
          const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
          callbacks.push(callback);
          return () => {
              const index = callbacks.indexOf(callback);
              if (index !== -1)
                  callbacks.splice(index, 1);
          };
      }
      $set($$props) {
          if (this.$$set && !is_empty($$props)) {
              this.$$.skip_bound = true;
              this.$$set($$props);
              this.$$.skip_bound = false;
          }
      }
  }

  function cubicOut(t) {
      const f = t - 1.0;
      return f * f * f + 1.0;
  }
  function quintOut(t) {
      return --t * t * t * t * t + 1;
  }

  function flip(node, { from, to }, params = {}) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;
      const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
      const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
      const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
      const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
      return {
          delay,
          duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
          easing,
          css: (t, u) => {
              const x = u * dx;
              const y = u * dy;
              const sx = t + u * from.width / to.width;
              const sy = t + u * from.height / to.height;
              return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
          }
      };
  }

  function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
      const o = +getComputedStyle(node).opacity;
      return {
          delay,
          duration,
          easing,
          css: t => `opacity: ${t * o}`
      };
  }

  /* src/Matches.svelte generated by Svelte v3.59.2 */

  function get_each_context(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[20] = list[i];
  	child_ctx[21] = list;
  	child_ctx[22] = i;
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[23] = list[i];
  	return child_ctx;
  }

  // (150:20) {#each OPTIONS as name}
  function create_each_block_1(ctx) {
  	let option;
  	let t_value = /*name*/ ctx[23] + "";
  	let t;

  	return {
  		c() {
  			option = element("option");
  			t = text(t_value);
  			set_style(option, "color", "#f5f8fa");
  			option.__value = /*name*/ ctx[23];
  			option.value = option.__value;
  		},
  		m(target, anchor) {
  			insert(target, option, anchor);
  			append(option, t);
  		},
  		p: noop,
  		d(detaching) {
  			if (detaching) detach(option);
  		}
  	};
  }

  // (99:10) {#each filteredFrames as frame (frame.id)}
  function create_each_block(key_1, ctx) {
  	let div5;
  	let div4;
  	let div0;
  	let t0;
  	let div2;
  	let div1;
  	let div1_class_value;
  	let div1_aria_valuenow_value;
  	let t1;
  	let span;
  	let div3;
  	let t2;
  	let select_1;
  	let t3;
  	let svg1;
  	let path1;
  	let t4;
  	let div5_intro;
  	let div5_outro;
  	let rect;
  	let stop_animation = noop;
  	let current;
  	let mounted;
  	let dispose;

  	function click_handler() {
  		return /*click_handler*/ ctx[14](/*frame*/ ctx[20]);
  	}

  	function click_handler_1() {
  		return /*click_handler_1*/ ctx[15](/*frame*/ ctx[20]);
  	}

  	let each_value_1 = OPTIONS;
  	let each_blocks = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	function select_1_change_handler() {
  		/*select_1_change_handler*/ ctx[16].call(select_1, /*each_value*/ ctx[21], /*frame_index*/ ctx[22]);
  	}

  	function click_handler_2() {
  		return /*click_handler_2*/ ctx[17](/*frame*/ ctx[20]);
  	}

  	return {
  		key: key_1,
  		first: null,
  		c() {
  			div5 = element("div");
  			div4 = element("div");
  			div0 = element("div");
  			t0 = space();
  			div2 = element("div");
  			div1 = element("div");
  			t1 = space();
  			span = element("span");
  			div3 = element("div");
  			div3.innerHTML = `<svg class="tag-item-accept svelte-lsuukb" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"></path></svg>`;
  			t2 = space();
  			select_1 = element("select");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t3 = space();
  			svg1 = svg_element("svg");
  			path1 = svg_element("path");
  			t4 = space();
  			attr(div0, "class", "scrubber-item svelte-lsuukb");
  			set_style(div0, "background-position", "-" + /*frame*/ ctx[20].offset[0] + "px -" + /*frame*/ ctx[20].offset[1] + "px");
  			set_style(div0, "background-image", "url(\"" + /*url*/ ctx[1] + "\")");
  			attr(div1, "class", div1_class_value = "progress-bar progress-bar-striped bg-" + confidence(/*frame*/ ctx[20].tag.prob) + " svelte-lsuukb");
  			attr(div1, "role", "progressbar");
  			set_style(div1, "width", /*frame*/ ctx[20].tag.prob * 100 + "%");
  			attr(div1, "aria-valuenow", div1_aria_valuenow_value = /*frame*/ ctx[20].tag.prob * 100);
  			attr(div1, "aria-valuemin", 0);
  			attr(div1, "aria-valuemax", 100);
  			attr(div2, "class", "progress");
  			set_style(div2, "height", "5px");
  			set_style(div3, "padding-right", "10px");
  			set_style(div3, "display", "inline");
  			set_style(select_1, "color", "#f5f8fa");
  			attr(select_1, "class", "tag-item-select svelte-lsuukb");
  			if (/*frame*/ ctx[20].tag.label === void 0) add_render_callback(select_1_change_handler);
  			attr(path1, "d", "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z");
  			attr(svg1, "height", "20");
  			attr(svg1, "width", "20");
  			attr(svg1, "viewBox", "0 0 20 20");
  			attr(svg1, "aria-hidden", "true");
  			attr(svg1, "focusable", "false");
  			attr(svg1, "class", "tag-item-reject svelte-lsuukb");
  			attr(span, "class", "tag-item badge badge-secondary svelte-lsuukb");
  			set_style(div4, "padding", "10px");
  			attr(div5, "class", "svelte-lsuukb");
  			toggle_class(div5, "selected", /*selected*/ ctx[3] === /*frame*/ ctx[20].id);
  			this.first = div5;
  		},
  		m(target, anchor) {
  			insert(target, div5, anchor);
  			append(div5, div4);
  			append(div4, div0);
  			append(div4, t0);
  			append(div4, div2);
  			append(div2, div1);
  			append(div4, t1);
  			append(div4, span);
  			append(span, div3);
  			append(span, t2);
  			append(span, select_1);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				if (each_blocks[i]) {
  					each_blocks[i].m(select_1, null);
  				}
  			}

  			select_option(select_1, /*frame*/ ctx[20].tag.label, true);
  			append(span, t3);
  			append(span, svg1);
  			append(svg1, path1);
  			append(div5, t4);
  			current = true;

  			if (!mounted) {
  				dispose = [
  					listen(div0, "click", click_handler),
  					listen(div3, "click", click_handler_1, { once: true }),
  					listen(select_1, "change", select_1_change_handler),
  					listen(svg1, "click", click_handler_2, { once: true })
  				];

  				mounted = true;
  			}
  		},
  		p(new_ctx, dirty) {
  			ctx = new_ctx;

  			if (!current || dirty & /*filteredFrames*/ 32) {
  				set_style(div0, "background-position", "-" + /*frame*/ ctx[20].offset[0] + "px -" + /*frame*/ ctx[20].offset[1] + "px");
  			}

  			if (!current || dirty & /*url*/ 2) {
  				set_style(div0, "background-image", "url(\"" + /*url*/ ctx[1] + "\")");
  			}

  			if (!current || dirty & /*filteredFrames, OPTIONS*/ 32 && div1_class_value !== (div1_class_value = "progress-bar progress-bar-striped bg-" + confidence(/*frame*/ ctx[20].tag.prob) + " svelte-lsuukb")) {
  				attr(div1, "class", div1_class_value);
  			}

  			if (!current || dirty & /*filteredFrames*/ 32) {
  				set_style(div1, "width", /*frame*/ ctx[20].tag.prob * 100 + "%");
  			}

  			if (!current || dirty & /*filteredFrames, OPTIONS*/ 32 && div1_aria_valuenow_value !== (div1_aria_valuenow_value = /*frame*/ ctx[20].tag.prob * 100)) {
  				attr(div1, "aria-valuenow", div1_aria_valuenow_value);
  			}

  			if (dirty & /*OPTIONS*/ 0) {
  				each_value_1 = OPTIONS;
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select_1, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_1.length;
  			}

  			if (dirty & /*filteredFrames, OPTIONS*/ 32) {
  				select_option(select_1, /*frame*/ ctx[20].tag.label);
  			}

  			if (!current || dirty & /*selected, filteredFrames*/ 40) {
  				toggle_class(div5, "selected", /*selected*/ ctx[3] === /*frame*/ ctx[20].id);
  			}
  		},
  		r() {
  			rect = div5.getBoundingClientRect();
  		},
  		f() {
  			fix_position(div5);
  			stop_animation();
  			add_transform(div5, rect);
  		},
  		a() {
  			stop_animation();

  			stop_animation = create_animation(div5, rect, flip, {
  				delay: 250,
  				duration: 250,
  				easing: quintOut
  			});
  		},
  		i(local) {
  			if (current) return;

  			add_render_callback(() => {
  				if (!current) return;
  				if (div5_outro) div5_outro.end(1);
  				div5_intro = create_in_transition(div5, fade, {});
  				div5_intro.start();
  			});

  			current = true;
  		},
  		o(local) {
  			if (div5_intro) div5_intro.invalidate();
  			div5_outro = create_out_transition(div5, fade, {});
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(div5);
  			destroy_each(each_blocks, detaching);
  			if (detaching && div5_outro) div5_outro.end();
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  // (184:12) {#if saving}
  function create_if_block(ctx) {
  	let div;

  	return {
  		c() {
  			div = element("div");
  			attr(div, "class", "lds-dual-ring");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	let div7;
  	let div6;
  	let div5;
  	let div0;
  	let t0;
  	let input;
  	let t1;
  	let t2_value = /*threshold*/ ctx[0] * 100 + "";
  	let t2;
  	let t3;
  	let t4;
  	let div2;
  	let div1;
  	let each_blocks = [];
  	let each_1_lookup = new Map();
  	let t5;
  	let div4;
  	let div3;
  	let button0;
  	let t7;
  	let button1;
  	let t8;
  	let current;
  	let mounted;
  	let dispose;
  	let each_value = /*filteredFrames*/ ctx[5];
  	const get_key = ctx => /*frame*/ ctx[20].id;

  	for (let i = 0; i < each_value.length; i += 1) {
  		let child_ctx = get_each_context(ctx, each_value, i);
  		let key = get_key(child_ctx);
  		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
  	}

  	let if_block = /*saving*/ ctx[4] && create_if_block();

  	return {
  		c() {
  			div7 = element("div");
  			div6 = element("div");
  			div5 = element("div");
  			div0 = element("div");
  			t0 = text("Threshold: ");
  			input = element("input");
  			t1 = space();
  			t2 = text(t2_value);
  			t3 = text(" %");
  			t4 = space();
  			div2 = element("div");
  			div1 = element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t5 = space();
  			div4 = element("div");
  			div3 = element("div");
  			button0 = element("button");
  			button0.textContent = "Close";
  			t7 = space();
  			button1 = element("button");
  			if (if_block) if_block.c();
  			t8 = text("\n            Add All Tags");
  			attr(input, "type", "range");
  			attr(input, "min", "0.1");
  			attr(input, "max", "0.9");
  			attr(input, "step", "0.1");
  			attr(input, "id", "stash-tag-threshold");
  			set_style(input, "margin", "0px");
  			set_style(input, "height", "10px");
  			attr(div0, "class", "modal-header svelte-lsuukb");
  			attr(div1, "class", "row justify-content-center");
  			attr(div2, "class", "modal-body");
  			attr(button0, "id", "tags-cancel");
  			attr(button0, "type", "button");
  			attr(button0, "class", "ml-2 btn btn-secondary");
  			attr(button1, "id", "tags-accept");
  			attr(button1, "type", "button");
  			attr(button1, "class", "ml-2 btn btn-primary");
  			attr(div4, "class", "ModalFooter modal-footer svelte-lsuukb");
  			attr(div5, "class", "modal-content");
  			attr(div6, "class", "modal-dialog modal-xl top-accent");
  			attr(div7, "class", "tagger-tabs svelte-lsuukb");
  		},
  		m(target, anchor) {
  			insert(target, div7, anchor);
  			append(div7, div6);
  			append(div6, div5);
  			append(div5, div0);
  			append(div0, t0);
  			append(div0, input);
  			set_input_value(input, /*threshold*/ ctx[0]);
  			append(div0, t1);
  			append(div0, t2);
  			append(div0, t3);
  			append(div5, t4);
  			append(div5, div2);
  			append(div2, div1);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				if (each_blocks[i]) {
  					each_blocks[i].m(div1, null);
  				}
  			}

  			append(div5, t5);
  			append(div5, div4);
  			append(div4, div3);
  			append(div3, button0);
  			append(div3, t7);
  			append(div3, button1);
  			if (if_block) if_block.m(button1, null);
  			append(button1, t8);
  			/*div7_binding*/ ctx[18](div7);
  			current = true;

  			if (!mounted) {
  				dispose = [
  					listen(input, "change", /*input_change_input_handler*/ ctx[13]),
  					listen(input, "input", /*input_change_input_handler*/ ctx[13]),
  					listen(input, "change", /*changeThreshold*/ ctx[11]),
  					listen(button0, "click", /*close*/ ctx[6]),
  					listen(button1, "click", /*saveAll*/ ctx[10])
  				];

  				mounted = true;
  			}
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*threshold*/ 1) {
  				set_input_value(input, /*threshold*/ ctx[0]);
  			}

  			if ((!current || dirty & /*threshold*/ 1) && t2_value !== (t2_value = /*threshold*/ ctx[0] * 100 + "")) set_data(t2, t2_value);

  			if (dirty & /*selected, filteredFrames, remove, OPTIONS, addMarker, confidence, url, select*/ 938) {
  				each_value = /*filteredFrames*/ ctx[5];
  				group_outros();
  				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
  				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
  				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
  				check_outros();
  			}

  			if (/*saving*/ ctx[4]) {
  				if (if_block) ; else {
  					if_block = create_if_block();
  					if_block.c();
  					if_block.m(button1, t8);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		i(local) {
  			if (current) return;

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o(local) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(div7);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].d();
  			}

  			if (if_block) if_block.d();
  			/*div7_binding*/ ctx[18](null);
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  function getCurrentVideo() {
  	return document.querySelector("#VideoJsPlayer_html5_api");
  }

  async function playVideoAtTime(time) {
  	const video = getCurrentVideo();
  	video.currentTime = time;
  	video.play();
  }

  function confidence(prob) {
  	prob = prob * 100;

  	if (prob < 50.0) {
  		return "danger";
  	} else if (prob < 75.0) {
  		return "warning";
  	} else {
  		return "success";
  	}
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let filteredFrames;
  	let { url = "" } = $$props;
  	let { frames = [] } = $$props;
  	let { threshold = 0.4 } = $$props;
  	let tags;
  	let self;
  	let selected;
  	let saving = false;

  	onMount(async () => {
  		tags = await getAllTags();
  		$$invalidate(0, threshold = Number(localStorage.getItem('stash-marker-threshold')) || 0.4);
  	});

  	async function close() {
  		self.remove();
  	}

  	function select(frame) {
  		if (selected === frame.id) {
  			$$invalidate(3, selected = null);
  		} else {
  			$$invalidate(3, selected = frame.id);
  			playVideoAtTime(frame.time);
  		}
  	}

  	function remove(id) {
  		$$invalidate(12, frames = frames.filter(x => x.id !== id));
  	}

  	async function addMarker(frame) {
  		const [,scene_id] = getScenarioAndID();
  		let time;
  		let tagId = tags[frame.tag.label];

  		if (selected && selected === frame.id) {
  			const video = getCurrentVideo();
  			time = video.currentTime;
  		} else {
  			time = frame.time;
  		}

  		await createMarker(scene_id, tagId, time);
  		remove(frame.id);
  		$$invalidate(3, selected = null);
  	}

  	function saveAll() {
  		$$invalidate(4, saving = true);

  		frames.forEach(async frame => {
  			await addMarker(frame);
  		});

  		$$invalidate(4, saving = false);
  		close();
  	}

  	function changeThreshold() {
  		localStorage.setItem("stash-marker-threshold", String(threshold));
  	}

  	function input_change_input_handler() {
  		threshold = to_number(this.value);
  		$$invalidate(0, threshold);
  	}

  	const click_handler = frame => {
  		select(frame);
  	};

  	const click_handler_1 = frame => {
  		addMarker(frame);
  	};

  	function select_1_change_handler(each_value, frame_index) {
  		each_value[frame_index].tag.label = select_value(this);
  		(($$invalidate(5, filteredFrames), $$invalidate(12, frames)), $$invalidate(0, threshold));
  	}

  	const click_handler_2 = frame => {
  		remove(frame.id);
  	};

  	function div7_binding($$value) {
  		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
  			self = $$value;
  			$$invalidate(2, self);
  		});
  	}

  	$$self.$$set = $$props => {
  		if ('url' in $$props) $$invalidate(1, url = $$props.url);
  		if ('frames' in $$props) $$invalidate(12, frames = $$props.frames);
  		if ('threshold' in $$props) $$invalidate(0, threshold = $$props.threshold);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*frames, threshold*/ 4097) {
  			$$invalidate(5, filteredFrames = frames.filter(x => x.tag.prob > threshold));
  		}
  	};

  	return [
  		threshold,
  		url,
  		self,
  		selected,
  		saving,
  		filteredFrames,
  		close,
  		select,
  		remove,
  		addMarker,
  		saveAll,
  		changeThreshold,
  		frames,
  		input_change_input_handler,
  		click_handler,
  		click_handler_1,
  		select_1_change_handler,
  		click_handler_2,
  		div7_binding
  	];
  }

  class Matches extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$1, create_fragment$1, safe_not_equal, { url: 1, frames: 12, threshold: 0 });
  	}
  }

  /* src/Button.svelte generated by Svelte v3.59.2 */

  function create_fragment(ctx) {
  	let button;
  	let mounted;
  	let dispose;

  	return {
  		c() {
  			button = element("button");
  			button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" class="svelte-1m5gxnd"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>`;
  			attr(button, "class", "svelte-1m5gxnd");
  			toggle_class(button, "scanner", /*scanner*/ ctx[0]);
  		},
  		m(target, anchor) {
  			insert(target, button, anchor);

  			if (!mounted) {
  				dispose = listen(button, "click", /*getMarkers*/ ctx[1]);
  				mounted = true;
  			}
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*scanner*/ 1) {
  				toggle_class(button, "scanner", /*scanner*/ ctx[0]);
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(button);
  			mounted = false;
  			dispose();
  		}
  	};
  }

  function instance($$self, $$props, $$invalidate) {
  	let scanner = false;

  	async function getMarkers() {
  		$$invalidate(0, scanner = true);
  		const [,scene_id] = getScenarioAndID();
  		let url = await getUrlSprite(scene_id);

  		if (!url) {
  			alert("No sprite found, please ensure you have sprites enabled and generated for your scenes.");
  			$$invalidate(0, scanner = false);
  			return;
  		}

  		// get image blob
  		const iblob = await fetch(url).then(res => res.blob());

  		let image = await new Promise(resolve => {
  				let reader = new FileReader();
  				reader.onload = () => resolve(reader.result);
  				reader.readAsDataURL(iblob);
  			});

  		// get vtt blob
  		const vtt_url = url.replace("_sprite.jpg", "_thumbs.vtt");

  		const vblob = await fetch(vtt_url).then(res => res.blob());

  		let vtt = await new Promise(resolve => {
  				let reader = new FileReader();
  				reader.onload = () => resolve(reader.result);
  				reader.readAsDataURL(vblob);
  			});

  		// query the api with a threshold of 0.4 as we want to do the filtering ourselves
  		var data = { "data": [image, vtt, 0.4] };

  		var requestDetails = {
  			method: "POST",
  			url: STASHMARKER_API_URL,
  			data: JSON.stringify(data),
  			headers: {
  				"Content-Type": "application/json; charset=utf-8"
  			},
  			onload(response) {
  				var data = JSON.parse(response.responseText);
  				let frames = data.data[0];
  				$$invalidate(0, scanner = false);

  				if (frames.length === 0) {
  					alert("No tags found");
  					return;
  				}

  				// find a div with class row
  				let row = document.querySelector(".row");

  				new Matches({ target: row, props: { frames, url } });
  			},
  			onerror(response) {
  				$$invalidate(0, scanner = false);
  				alert("Error: " + response.responseText);
  			}
  		};

  		GM_xmlhttpRequest(requestDetails);
  	}

  	return [scanner, getMarkers];
  }

  class Button extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance, create_fragment, safe_not_equal, {});
  	}
  }

  const { stash } = unsafeWindow.stash;
  stash.addEventListener("page:scene", function () {
      let elms = ".ml-auto .btn-group";
      waitForElm(elms).then(() => {
          new Button({ target: document.querySelector(elms) });
      });
  });

})();
