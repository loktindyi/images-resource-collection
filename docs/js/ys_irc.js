// 基础函数与变量
const world = {
    watch: (element, listener, dowhat) => { $(document).on(listener, element, dowhat) },
    el: {
        anemo: '风',
        cryo: '冰',
        dendro: '草',
        electro: '雷',
        geo: '岩',
        hydro: '水',
        pyro: '火'
    },
    wl: {
        sword: '单手剑',
        claymore: '双手剑',
        polearm: '长柄武器',
        catalyst: '法器',
        bow: '弓'
    },
    rv: {
        v10: '1.0',
        v11: '1.1',
        v12: '1.2',
        v13: '1.3',
        v14: '1.4',
        v15: '1.5',
        v16: '1.6',
        v20: '2.0',
        v21: '2.1',
        v22: '2.2',
        v66: '6.6',
    }
}
// say
const say = msg => {
    $('#toast').html(msg)
    $('#toast').css('display', 'inline')
    setTimeout(() => { $('#toast').css('display', 'none') }, Math.min(msg.length / 4, 10) * 1000)
}
// 过滤掉数据中不可用信息
let imgDataAvailable = {}
Object.entries(imgData).forEach(v => { if (v[1].Available) imgDataAvailable[v[0]] = v[1] })
// 根据过滤器更新页面
const getCharacter = (ele, wea, rev) => {
    let displayCharacterList = []
    Object.entries(imgDataAvailable).filter(c => ele.includes(c[1].Element) && wea.includes(c[1].Weapon) && rev.includes(c[1].ReleaseVersion)).forEach(e => { displayCharacterList.push(e[0]) })
    const noDisplayCharacterList = Object.keys(imgDataAvailable).filter(x => !displayCharacterList.some(v => x == v))
    displayCharacterList.forEach(d => { $(`#${d}-li`).css('display', 'block') })
    noDisplayCharacterList.forEach(nd => { $(`#${nd}-li`).css('display', 'none') })
    return [displayCharacterList, noDisplayCharacterList]
}
// 当前页全选
const selectAll = (bool) => { $(`.chac-navbar li${bool ? '[style*="block"]' : ''}`).each(function () { $(this).find('input')[0].checked = bool }) }
// 清除过滤器 不取消选择
const resetFilter = () => {
    // selectAll(false);
    $('input[name="element"]:checked, input[name="weapon"]:checked, input[name="releaseVer"]:checked').each(function () { this.checked = false })
    getCharacter(Object.keys(world.el), Object.keys(world.wl), Object.values(world.rv))
}
// 导出
const exportToClip = () => {
    let pscode = `$wClient = New-Object System.Net.WebClient
$saveDir = "$env:USERPROFILE\\Desktop\\GenshinImages\\"
if (-not (Test-Path $saveDir)) { $null = New-Item -ItemType Directory $saveDir }\n`
    if ($('.chac-label input:checked').length) {
        let chas = []
        $('.chac-label input:checked').each(function () {
            let id = this.id
            let cha = imgDataAvailable[id]
            chas.push(' ' + cha.Name)
            pscode += `$wClient.DownloadFile('${imgDataAvailable[id].Icon}', $saveDir + '${id}[Icon].png')
${cha.Card !== null ? `$wClient.DownloadFile('${cha.Card}', $saveDir + '${id}[Card].png')` : ''}
${cha.Portrait !== null ? `$wClient.DownloadFile('${cha.Portrait}', $saveDir + '${id}[Portrait].png')` : ''}
${cha.Wish !== null ? `$wClient.DownloadFile('${cha.Wish}', $saveDir + '${id}[Wish].png')` : ''}
${cha.Avatar !== null ? `$wClient.DownloadFile('${cha.Avatar}', $saveDir + '${id}[Avatar].png')` : ''}\n`
        })
        pscode += 'explorer.exe $saveDir'
        if (confirm(`共 ${chas.length} 个角色：${chas}`)) {
            say(`导出到剪切板 共 ${chas.length} 个角色：${chas.length > 7 ? chas.slice(0, 7) + ' 等...' : chas}`)
            navigator.clipboard.writeText(pscode)
        } else say('导出被取消')
    } else say('还未选择角色')
}
// 初始化过滤器，读取所有角色并渲染
const loadAllCharacters = () => {
    Object.entries(world.el).forEach(e => { $('ul.elem-navbar').append($(`<li><label class="elem-label ${e[0]}-lab" for="${e[0]}"><span>${e[1]}</span><img src="./img/elements/${e[0]}.png" alt="${e[1]}"></label></li>`)) })
    Object.entries(world.wl).forEach(w => { $('ul.weap-navbar').append($(`<li><label class="weap-label ${w[0]}-lab" for="${w[0]}"><span>${w[1]}</span><img src="./img/weapons/${w[0]}.png" alt="${w[1]}"></label></li>`)) })
    Object.entries(world.rv).forEach(v => { $('ul.rev-navbar').append($(`<li><label class="rev-label ${v[0]}-lab" for="${v[0]}"><span>${v[1]}</span></label></li>`)) })
    Object.entries(imgDataAvailable).forEach(c => { $('ul.chac-navbar').append($(`<li id="${c[0]}-li" style="display: block;"><label class="chac-label" for="${c[0]}"><input type="checkbox" id="${c[0]}"><img src="./img/icon/${c[1].IconName}.png" alt="${c[1].Name}"><span>${c[1].Name}</span></label></li>`)) })
    $('#FuraVetind-li').html(`<label class="fura-label"><input type="checkbox" style="display: none;"><img src="./img/icon/FuraVetind.png" alt="风风轮舞"><span>风风轮舞</span></label>`)
}
$('ul.chac-navbar').ready(() => {
    loadAllCharacters()
    say(`这个工具应在电脑上使用，手机只能看看...`)
})
// 读取过滤器
const loadFilter = () => {
    let eleList = [], weaList = [], revList = []
    $('#element input:checked').each(function () { eleList.push(this.id) })
    $('#weapon input:checked').each(function () { weaList.push(this.id) })
    $('#releaseVer input:checked').each(function () { revList.push(this.id) })
    revList = revList.map(v => v[1] + '.' + v[2])
    return [eleList.length ? eleList : Object.keys(world.el), weaList.length ? weaList : Object.keys(world.wl), revList.length ? revList : Object.values(world.rv)]
}
world.watch('#element input, #weapon input, #releaseVer input', 'change', () => { getCharacter(...loadFilter()) })
