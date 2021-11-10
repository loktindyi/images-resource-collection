// 过滤掉数据中不可用信息
let availableImgData = {}
Object.entries(imgData).forEach(v => { if (v[1].Available) availableImgData[v[0]] = v[1] })

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

// 初始化过滤器，读取所有角色并渲染
const vApp = new Vue({
    el: '#app',
    data: {
        elementList: world.el,
        weaponList: world.wl,
        releaseVerList: world.rv,
        characterList: availableImgData,
        characterCount: Object.keys(availableImgData).length,
        chosenCharacterList: [],
        elFilter: [],
        wlFilter: [],
        rvFilter: 'ARV',
        message: '',
        show: false
    },
    computed: {
        displayCharacterList: function () {
            let displayList = {}
            let elFilter = this.elFilter, wlFilter = this.wlFilter
            if (!elFilter.length) elFilter = Object.keys(world.el)
            if (!wlFilter.length) wlFilter = Object.keys(world.wl)
            Object.entries(availableImgData).forEach(c => { displayList[c[0]] = elFilter.includes(c[1].Element) && wlFilter.includes(c[1].Weapon) && (this.rvFilter === c[1].ReleaseVersion || this.rvFilter === 'ARV') })
            return displayList
        }
    },
    methods: {
        // 清除过滤器 不取消选择
        resetFilter: function () {
            this.elFilter = []
            this.wlFilter = []
            this.rvFilter = 'ARV'
        },
        // 当前页全选|不选
        selectAll: function (bool) {
            if (bool) {
                Object.keys(availableImgData).forEach(b => {
                    if (this.displayCharacterList[b]) {
                        this.chosenCharacterList.push(b)
                    }
                })
            } else {
                this.chosenCharacterList = []
            }
        },
        say: function (msg) {
            this.message = msg
            this.show = true
            setTimeout(() => { this.show = false }, Math.min(msg.length / 4, 10) * 1000)
        },
        exportToClip: function () {
            let pscode = `$w = New-Object System.Net.WebClient
$s = "$env:USERPROFILE\\Desktop\\GenshinImages\\"
if (-not (Test-Path $s)) { $null = New-Item -ItemType Directory $s }\n`
            if (this.chosenCharacterList.length) {
                let chas = []
                this.chosenCharacterList.forEach(id => {
                    let cha = availableImgData[id]
                    chas.push(' ' + cha.Name)
                    pscode += `$w.DownloadFile('${availableImgData[id].Icon}', $s + '${id}[Icon].png')
${cha.Card !== null ? `$w.DownloadFile('${cha.Card}', $s + '${id}[Card].png')` : '# 没有 Card 的图像'}
${cha.Portrait !== null ? `$w.DownloadFile('${cha.Portrait}', $s + '${id}[Portrait].png')` : '# 没有 Portrait 的图像'}
${cha.Wish !== null ? `$w.DownloadFile('${cha.Wish}', $s + '${id}[Wish].png')` : '# 没有 Wish 的图像'}
${cha.Avatar !== null ? `$w.DownloadFile('${cha.Avatar}', $s + '${id}[Avatar].png')` : '# 没有 Avatar 的图像'}\n`
                })
                pscode += `# 再次按下【Enter】键以打开存储目录\nexplorer.exe $s`
                if (confirm(`共 ${chas.length} 个角色：${chas}`)) {
                    this.say(`导出到剪切板 共 ${chas.length} 个角色：${chas.length > 7 ? chas.slice(0, 7) + ' 等...' : chas}`)
                    navigator.clipboard.writeText(pscode)
                } else this.say('导出被取消')
            } else this.say('还未选择角色')
        }
    }
})
// 初始化
vApp.resetFilter()

$('#FuraVetind-li').html(`<label class="fura-label"><input type="checkbox" style="display: none;"><img src="./img/icon/FuraVetind.png" alt="风风轮舞"><span>风风轮舞</span></label>`)

vApp.say(`这个工具应在电脑上使用，手机看看就好...`)
