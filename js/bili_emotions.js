const api = ['https://api.bilibili.com/x/emote/user/panel/web?business=reply']
const world = { watch: (element, listener, dowhat) => { $(document).on(listener, element, dowhat) } }
const biliEmojiIds = [1, 2, 53]

biliEmojis = biliEmojis.data.packages.filter(r => biliEmojiIds.includes(r.id))

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
    return emoList.length ? emoList : biliEmojiIds
}
// 根据过滤器更新页面
const getEmojis = (emo) => {
    let displayEmojiList = []
    biliEmojis.filter(c => emo.includes(c.id)).forEach(e => { displayEmojiList.push(e) })
    const noDisplayEmojiList = biliEmojis.filter(x => !displayEmojiList.some(v => x == v))
    displayEmojiList.forEach(d => { $(`.s${d.id}`).css('display', 'block') })
    noDisplayEmojiList.forEach(nd => { $(`.s${nd.id}`).css('display', 'none') })
    return [displayEmojiList, noDisplayEmojiList]
}
// 初始化，读取所有过滤器、表情并渲染
const loadAllEmojis = () => {
    biliEmojis.forEach(emojisInfo => {
        const name = emojisInfo.text.replace('_', ' ')
        const id = emojisInfo.id
        $('#series').prepend($(`<input type="checkbox" name="series" id="s${id}">`))
        $('ul.series-navbar').append($(`<li><label class="series-label s${id}-lab" for="s${id}"><span>${name}</span><img src="${emojisInfo.url}" alt="${name}"></label></li>`))
        emojisInfo.emote.forEach(emojiInfo => {
            const eid = emojiInfo.id
            $('ul.emojis-navbar').append($(`<li class="s${id}" style="display: block;"><label class="emojis-label" for="e${eid}"><input type="checkbox" id="e${eid}"><img src="${emojiInfo.url}" alt="${emojiInfo.text}"><span>${emojiInfo.text.replace(/\[|\]/g, '').replace('_', ' ')}</span></label></li>`))
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
    getEmojis(biliEmojiIds)
}
// 导出
const exportToClip = () => {
    let pscode = `$wClient = New-Object System.Net.WebClient
$saveDir = "$env:USERPROFILE\\Desktop\\BiliEmojis\\"
if (-not (Test-Path $saveDir)) { $null = New-Item -ItemType Directory $saveDir }\n`
    if ($('.emojis-label input:checked').length) {
        let emos = []
        $('.emojis-label input:checked').each(function () {
            biliEmojis.forEach(e => {
                e.emote.filter(v => v.id == parseInt(this.id.slice(1))).forEach(x => {
                    pscode += `$wClient.DownloadFile('${x.url}', $saveDir + '${x.text}.png')\n`
                    emos.push(x.text)
                })
            })
        })
        pscode += 'explorer.exe $saveDir'
        if (confirm(`共 ${emos.length} 个表情：${emos}`)) {
            say(`导出到剪切板 共 ${emos.length} 个表情：${emos.length > 7 ? emos.slice(0, 7) + ' 等...' : emos}`)
            navigator.clipboard.writeText(pscode)
        } else say('导出被取消')
    } else say('还未选择表情')
}

world.watch('#series input', 'change', () => { getEmojis(loadFilter()) })
