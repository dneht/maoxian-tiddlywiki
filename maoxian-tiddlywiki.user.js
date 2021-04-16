// ==UserScript==
// @name         Maoxian Tiddlywiki
// @name:zh-CN   Maoxian插件结果导入Tiddlywiki
// @namespace    https://github.com/dneht/maoxian-tiddlywiki
// @version      0.1
// @author       dneht
// @match        https://*/*
// @match        http://*/*
// @grant        GM_log
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      self
// @connect      localhost
// @connect      127.0.0.1
// ==/UserScript==

(function() {
    'use strict';

    const baseAddr = 'http://localhost:8080';
    const putTiddlerUrl = baseAddr + '/recipes/default/tiddlers/';

    function putTiddler(name, content, tags = []) {
        GM_log('new tiddler', name, tags);
        GM_xmlhttpRequest({
            method: 'PUT',
            timeout: 2000,
            url: putTiddlerUrl + name,
            headers: {
                'Content-type': 'application/json',
                'X-Requested-With': 'TiddlyWiki',
            },
            data: JSON.stringify({
                'title': name,
                'text': content,
                'tags': tags,
                'type': 'text/x-markdown',
            }),
            onerror: (res) => {
                GM_log('put tiddler error', res);
            },
        });
    }

    function listenMxEvent(evName, listener) {
        document.addEventListener(evName, function(e) {
            // 注：有的事件会带有消息，消息为 JSON 字符串
            const msg = JSON.parse(e.detail || '{}');
            listener(msg);
        })
    }

    listenMxEvent('mx-wc.clipped', function(msg) {
        if (!msg.clipping || !msg.clipping.info || !msg.clipping.tasks) {
            return;
        }
        const info = msg.clipping.info;
        if (info.format !== 'md' && info.format !== 'markdown') {
            GM_log('not support clip type: ', info);
            return;
        }
        for (const task of msg.clipping.tasks) {
            if (task.taskType === 'mainFileTask') {
                putTiddler(info.title, task.text, info.tags);
            }
        }
    });
})();
