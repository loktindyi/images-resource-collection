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
        arv: 'ARV',
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
        v66: '6.6'
    }
}
// say
const vToast = new Vue({
    el: '#toast',
    data: {
        message: '',
        show: false
    },
    methods: {
        say: function (msg) {
            this.message = msg
            this.show = true
            setTimeout(() => { this.show = false }, Math.min(msg.length / 4, 10) * 1000)
        }
    },
})

// 过滤掉数据中不可用信息
let availableImgData = {}
Object.entries(imgData).forEach(v => { if (v[1].Available) availableImgData[v[0]] = v[1] })
// 根据过滤器更新页面
const getCharacter = (ele, wea, rev) => {
    let displayCharacterList = []
    Object.entries(availableImgData).filter(c => ele.includes(c[1].Element) && wea.includes(c[1].Weapon) && rev.includes(c[1].ReleaseVersion)).forEach(e => { displayCharacterList.push(e[0]) })
    const noDisplayCharacterList = Object.keys(availableImgData).filter(x => !displayCharacterList.some(v => x == v))
    displayCharacterList.forEach(d => { $(`#${d}-li`).css('display', 'block') })
    noDisplayCharacterList.forEach(nd => { $(`#${nd}-li`).css('display', 'none') })
    return [displayCharacterList, noDisplayCharacterList]
}
// 当前页全选
const selectAll = (bool) => { $(`.chac-li${bool ? '[style*="block"]' : ''}`).each(function () { $(this).find('input')[0].checked = bool }) }
// 清除过滤器 不取消选择
const resetFilter = () => {
    // selectAll(false);
    $('.elem:checked, .weap:checked, .rev:checked').each(function () { this.checked = false })
    getCharacter(Object.keys(world.el), Object.keys(world.wl), Object.values(world.rv))
}
// 导出
const exportToClip = () => {
    let pscode = `$w = New-Object System.Net.WebClient
$s = '$env:USERPROFILE\\Desktop\\GenshinImages\\'
if (-not (Test-Path $s)) { $null = New-Item -ItemType Directory $s }\n`
    if ($('.chac-label input:checked').length) {
        let chas = []
        $('.chac-label input:checked').each(function () {
            let id = this.id
            let cha = availableImgData[id]
            chas.push(' ' + cha.Name)
            pscode += `$w.DownloadFile('${availableImgData[id].Icon}', $s + '${id}[Icon].png')
${cha.Card !== null ? `$w.DownloadFile('${cha.Card}', $s + '${id}[Card].png')` : ''}
${cha.Portrait !== null ? `$w.DownloadFile('${cha.Portrait}', $s + '${id}[Portrait].png')` : ''}
${cha.Wish !== null ? `$w.DownloadFile('${cha.Wish}', $s + '${id}[Wish].png')` : ''}
${cha.Avatar !== null ? `$w.DownloadFile('${cha.Avatar}', $s + '${id}[Avatar].png')` : ''}\n`
        })
        pscode += 'explorer.exe $saveDir'
        if (confirm(`共 ${chas.length} 个角色：${chas}`)) {
            vToast.say(`导出到剪切板 共 ${chas.length} 个角色：${chas.length > 7 ? chas.slice(0, 7) + ' 等...' : chas}`)
            navigator.clipboard.writeText(pscode)
        } else vToast.say('导出被取消')
    } else vToast.say('还未选择角色')
}
// 初始化过滤器，读取所有角色并渲染
const loadAllCharacters = () => {
    const vFilters = new Vue({
        el: '#filter',
        data: {
            elementList: world.el,
            weaponList: world.wl,
            releaseVerList: world.rv
        }
    })
    const vCharacters = new Vue({
        el: '.chac-list',
        data: {
            characterList: availableImgData
        }
    })
    $('#arv').attr('checked', true)
    $('#FuraVetind-li').html(`<label class="fura-label"><input type="checkbox" style="display: none;"><img src="./img/icon/FuraVetind.png" alt="风风轮舞"><span>风风轮舞</span></label>`)
}
$('ul.chac-navbar').ready(() => {
    loadAllCharacters()
    vToast.say(`这个工具应在电脑上使用，手机只能看看...`)
})
// 读取过滤器
const loadFilter = () => {
    let eleList = [], weaList = [], rev = 'arv'
    $('.elem:checked').each(function () { eleList.push(this.id) })
    $('.weap:checked').each(function () { weaList.push(this.id) })
    $('.rev:checked').each(function () { rev = this.id })
    rev = rev[1] + '.' + rev[2]
    return [eleList.length ? eleList : Object.keys(world.el), weaList.length ? weaList : Object.keys(world.wl), rev === 'r.v' ? Object.values(world.rv) : [rev]]
}
world.watch('.elem, .weap, .rev', 'change', () => { getCharacter(...loadFilter()) })
