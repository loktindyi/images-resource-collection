const ysEmojiIds = [7, 8]
const api = ['https://bbs-api-static.mihoyo.com/misc/api/emoticon_set']
const world = { watch: (element, listener, dowhat) => { $(document).on(listener, element, dowhat) } }

let ysEmojis
$.ajax({
    type: 'GET',
    url: api[0],
    dataType: 'json',
    async: false,
    success: res => {
        ysEmojis = res.data.list.filter(e => ysEmojiIds.includes(e.id))//e.is_available)//
        ysEmojis.forEach(e => {
            if (e.id === 7) e.list.push({
                "id": 473,
                "name": "德丽莎-睿智",
                "icon": "https://img-static.mihoyo.com/communityweb/upload/553f30b15e8557a604b2a09f9729a47d.png",
                "sort_order": 14,
                "static_icon": "",
                "updated_at": 1627466666,
                "is_available": true,
                "status": "published"
            })
        });
    }
})
// say
const say = msg => {
    $('#toast').html(msg)
    $('#toast').css('display', 'inline')
    setTimeout(() => { $('#toast').css('display', 'none') }, Math.min(msg.length / 4, 10) * 1000)
}
// 读取过滤器
const loadFilter = () => {
    let emoList = []
    $('#series input:checked').each(function () { emoList.push(parseInt(this.id.slice(1))) })
    return emoList.length ? emoList : ysEmojiIds
}
// 根据过滤器更新页面
const getEmojis = (emo) => {
    let displayEmojiList = []
    ysEmojis.filter(c => emo.includes(c.id)).forEach(e => { displayEmojiList.push(e) })
    const noDisplayEmojiList = ysEmojis.filter(x => !displayEmojiList.some(v => x == v))
    displayEmojiList.forEach(d => { $(`.s${d.id}`).css('display', 'block') })
    noDisplayEmojiList.forEach(nd => { $(`.s${nd.id}`).css('display', 'none') })
    return [displayEmojiList, noDisplayEmojiList]
}
// 初始化，读取所有过滤器、表情并渲染
const loadAllEmojis = () => {
    ysEmojis.forEach(emojisInfo => {
        const name = emojisInfo.name
        const id = emojisInfo.id
        $('#series').prepend($(`<input type="radio" name="series" id="s${id}">`))
        $('ul.series-navbar').append($(`<li><label class="series-label s${id}-lab" for="s${id}"><span>${name}</span><img src="${emojisInfo.icon}" alt="${name}"></label></li>`))
        emojisInfo.list.forEach(emojiInfo => {
            const eid = emojiInfo.id
            $('ul.emojis-navbar').append($(`<li class="s${id}" style="display: block;"><label class="emojis-label" for="e${eid}"><input type="checkbox" id="e${eid}"><img src="${emojiInfo.icon}" alt="${emojiInfo.name}"><span>${emojiInfo.name.replace('-', ' ')}</span></label></li>`))
        })
    })
}
$(document).ready(() => { loadAllEmojis() })
// 当前页全选
const selectAll = (bool) => { $(`.emojis-navbar li${bool ? '[style*="block"]' : ''}`).each(function () { $(this).find('input')[0].checked = bool }) }
// 清除过滤器 不取消选择
const resetFilter = () => {
    // selectAll(false);
    $('input[name="series"]:checked').each(function () { this.checked = false })
    getEmojis(ysEmojiIds)
}
// 导出
const exportToClip = () => {
    let pscode = `$wClient = New-Object System.Net.WebClient
$saveDir = "$env:USERPROFILE\\Desktop\\GenshinEmojis\\"
if (-not (Test-Path $saveDir)) { $null = New-Item -ItemType Directory $saveDir }\n`
    if ($('.emojis-label input:checked').length) {
        let emos = []
        $('.emojis-label input:checked').each(function () {
            ysEmojis.forEach(e => {
                e.list.filter(v => v.id == parseInt(this.id.slice(1))).forEach(x => {
                    pscode += `$wClient.DownloadFile('${x.icon}', $saveDir + '${x.name}.png')\n`
                    emos.push(x.name)
                })
            })
        })
        pscode += 'explorer.exe $saveDir'
        if (confirm(`共 ${emos.length} 个表情：${emos}`)) {
            say(`导出到剪切板 共 ${emos.length} 个表情：${emos.length > 4 ? emos.slice(0, 4) + ' 等...' : emos}`)
            navigator.clipboard.writeText(pscode)
        } else say('导出被取消')
    } else say('还未选择表情')
}

world.watch('#series input', 'change', () => { getEmojis(loadFilter()) })
