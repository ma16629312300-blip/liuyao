import type { PaiPanResult, YaoLine } from './types';
import { getXunKongDesc } from './xunkong';
import { getHexagramRelationDesc, getAdvanceRetreatDesc } from './hexagramRelation';
import yaociData from '../data/yaoci.json';

const POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

/**
 * 本地规则解卦引擎
 * 无需 API，根据六爻理论自动生成解卦文案
 */
export function generateLocalInterpretation(
  paiPan: PaiPanResult,
  question: string
): string {
  const { originalHexagram, changedHexagram, changingLines, monthDay, yongShen } = paiPan;
  const lines = originalHexagram.lines;

  const sections: string[] = [];

  // ===== 1. 卦象总览 =====
  sections.push('═══════════════════════════════');
  sections.push('　一、卦象总览');
  sections.push('═══════════════════════════════');
  sections.push('');
  sections.push(`本卦：${originalHexagram.name}（${originalHexagram.palace}宫）`);
  sections.push(`　上卦${originalHexagram.upperTrigram}（${getWuxingName(originalHexagram.upperTrigram)}）`);
  sections.push(`　下卦${originalHexagram.lowerTrigram}（${getWuxingName(originalHexagram.lowerTrigram)}）`);
  sections.push(`　卦辞：${originalHexagram.description}`);
  if (originalHexagram.judgment) {
    sections.push(`　彖曰：${originalHexagram.judgment}`);
  }
  if (originalHexagram.image) {
    sections.push(`　象曰：${originalHexagram.image}`);
  }

  // 卦象详解
  const hexagramDetail = getHexagramDetail(originalHexagram.name);
  if (hexagramDetail) {
    sections.push('');
    sections.push(`　卦义：${hexagramDetail}`);
  }

  // 卦象关系
  if (paiPan.hexagramRelation) {
    sections.push('');
    sections.push(`卦象关系：${paiPan.hexagramRelation}`);
    sections.push(`　${getHexagramRelationDesc(paiPan.hexagramRelation)}`);
  }

  // 旬空
  const xunkongLines = lines.filter(l => l.isXunKong);
  if (xunkongLines.length > 0) {
    sections.push('');
    sections.push(`旬空：${getXunKongDesc(monthDay.dayGanZhi)}`);
    const xkPositions = xunkongLines.map(l => POSITIONS[l.index]).join('、');
    sections.push(`　空亡之爻：${xkPositions}`);
    sections.push('　旬空之爻力量减弱，需待填实或被冲开方能发挥全效。');
  }

  if (changedHexagram) {
    sections.push('');
    sections.push(`变卦：${changedHexagram.name}（${changedHexagram.palace}宫）`);
    const changeNames = changingLines.map((i) => POSITIONS[i]).join('、');
    sections.push(`动爻：${changeNames}`);
    sections.push(`　${originalHexagram.name}之${changedHexagram.name}，${changingLines.length}爻动。`);
    sections.push(`　${getChangingInterpretation(originalHexagram.name, changedHexagram.name, changingLines)}`);

    // 进退神
    if (paiPan.lineAdvanceRetreat) {
      const arInfo = paiPan.lineAdvanceRetreat
        .map((ar, i) => ar ? `${POSITIONS[changingLines[i]]}${ar}：${getAdvanceRetreatDesc(ar)}` : null)
        .filter(Boolean);
      if (arInfo.length > 0) {
        sections.push('');
        arInfo.forEach(info => sections.push(`　${info}`));
      }
    }

    // 动爻爻辞
    if (changingLines.length > 0) {
      const yaociHexagram = yaociData.find(h => h.id === originalHexagram.id);
      if (yaociHexagram) {
        sections.push('');
        changingLines.forEach(ci => {
          const yc = yaociHexagram.lines[ci];
          sections.push(`　${yc.position}爻辞：${yc.text}`);
          if (yc.xiang) sections.push(`　象曰：${yc.xiang}`);
        });
      }
    }

    const changedDetail = getHexagramDetail(changedHexagram.name);
    if (changedDetail) {
      sections.push(`　变卦之义：${changedDetail}`);
    }
  } else {
    sections.push('');
    sections.push('此卦为静卦，无动爻。静卦以本卦卦辞为主断。');
  }

  // ===== 2. 世应用神分析 =====
  sections.push('');
  sections.push('═══════════════════════════════');
  sections.push('　二、世应用神分析');
  sections.push('═══════════════════════════════');
  sections.push('');

  const shiLine = lines[originalHexagram.shiIndex];
  const yingLine = lines[originalHexagram.yingIndex];

  sections.push(`世爻在${POSITIONS[originalHexagram.shiIndex]}（${shiLine.liuqin}，${shiLine.wuxing}），为问卦之人。`);
  sections.push(`应爻在${POSITIONS[originalHexagram.yingIndex]}（${yingLine.liuqin}，${yingLine.wuxing}），为所问之事之应。`);

  const shiYingRel = getShiYingRelation(shiLine, yingLine);
  sections.push(`世应关系：${shiYingRel}`);

  // 用神
  const yongShenLines = lines.filter((l) => l.liuqin === yongShen.liuqin);
  sections.push('');
  sections.push(`用神取${yongShen.liuqin}爻（${yongShen.description}）。`);
  sections.push(`卦中${yongShen.liuqin}爻出现${yongShenLines.length}处。`);

  yongShenLines.forEach((l) => {
    const wsLabel = getWangshuaiDesc(l.wangshuai || '休');
    const shiLabel = l.isShi ? '（持世）' : l.isYing ? '（临应）' : '';
    sections.push(
      `　${POSITIONS[l.index]}：${l.tianGan}${l.dizhi} ${l.wuxing}，${l.wangshuai}${wsLabel}${shiLabel}`
    );
  });

  // 伏神
  const fushenLines = lines.filter(l => l.feiShen);
  if (fushenLines.length > 0) {
    sections.push('');
    sections.push('伏神信息：');
    fushenLines.forEach(l => {
      const fs = l.feiShen!;
      sections.push(`　${POSITIONS[l.index]}之下伏${fs.liuqin} ${fs.dizhi}（${fs.wuxing}）`);
      sections.push(`　飞神：${fs.feiYaoLiuQin} ${fs.feiYaoDizhi}，${fs.relation}`);
    });
  }

  const yongScore = getYongShenScore(yongShenLines, monthDay.monthZhi, monthDay.dayZhi);
  sections.push(`用神综合状态：${yongScore}`);

  // 伏神影响
  if (fushenLines.length > 0 && yongShenLines.length === 0) {
    sections.push('注：用神伏藏，需看伏神是否得日辰月建冲开。待出伏之时方能成事。');
  }

  // ===== 3. 五行生克分析 =====
  sections.push('');
  sections.push('═══════════════════════════════');
  sections.push('　三、五行生克分析');
  sections.push('═══════════════════════════════');
  sections.push('');

  const monthWx = getDizhiWuxing(monthDay.monthZhi);
  const dayWx = getDizhiWuxing(monthDay.dayZhi);
  sections.push(`月建${monthDay.monthZhi}（${monthWx}），日辰${monthDay.dayZhi}（${dayWx}）。`);

  const mainYongLine = yongShenLines[0];
  if (mainYongLine) {
    sections.push(`用神${mainYongLine.wuxing}，月建${monthWx}，${getWuxingRelWords(mainYongLine.wuxing || '土', monthWx)}。`);
    sections.push(`用神${mainYongLine.wuxing}，日辰${dayWx}，${getWuxingRelWords(mainYongLine.wuxing || '土', dayWx)}。`);

    if (changingLines.length > 0) {
      changingLines.forEach((idx) => {
        const cl = lines[idx];
        const rel = getWuxingRelWords(cl.wuxing || '土', mainYongLine.wuxing || '土');
        sections.push(`动爻${POSITIONS[idx]}（${cl.wuxing}）对用神（${mainYongLine.wuxing}）：${rel}。`);
      });
    }
  }

  // ===== 4. 六亲六兽 =====
  sections.push('');
  sections.push('═══════════════════════════════');
  sections.push('　四、六亲六兽辅助信息');
  sections.push('═══════════════════════════════');
  sections.push('');

  const uniqueLiuQin = [...new Set(lines.map((l) => l.liuqin))];
  uniqueLiuQin.forEach((lq) => {
    const lqLines = lines.filter((l) => l.liuqin === lq);
    const posNames = lqLines.map((l) => POSITIONS[l.index]).join('、');
    sections.push(`${lq}：临${posNames}`);
  });

  const shiShou = shiLine.liushou || '青龙';
  sections.push(`世爻临${shiShou}，${getLiuShouDesc(shiShou)}`);

  // ===== 5. 综合论断 =====
  sections.push('');
  sections.push('═══════════════════════════════');
  sections.push('　五、综合论断');
  sections.push('═══════════════════════════════');
  sections.push('');

  const conclusion = getConclusion(paiPan, question);
  sections.push(`关于「${question}」的占断：`);
  sections.push('');
  sections.push(conclusion);

  // ===== 6. 建议 =====
  sections.push('');
  sections.push('═══════════════════════════════');
  sections.push('　六、行动建议');
  sections.push('═══════════════════════════════');
  sections.push('');

  const advice = getAdvice(paiPan, question);
  sections.push(advice);

  sections.push('');
  sections.push('──────');
  sections.push('以上为基于六爻纳甲理论的自动解卦分析。卦象仅供参考，最终决策请结合实际情况理性判断。');

  return sections.join('\n');
}

// ====== 64卦详解映射 ======

function getHexagramDetail(name: string): string {
  const map: Record<string, string> = {
    '乾为天': '六爻纯阳，刚健中正。得此卦者，占事可成，但须尽人力以合天道。龙行天下，当自强不息。',
    '坤为地': '六爻纯阴，柔顺承载。得此卦者，宜守不宜攻，以柔克刚，厚德载物。顺应自然，不可强求。',
    '水雷屯': '万物始生，创业维艰。如草木初萌，需耐心呵护。前路虽有险阻，坚持初心必有所成。',
    '山水蒙': '蒙昧未开，如孩童求学。宜虚心请教，不宜妄自决断。启蒙之道在于明师指引。',
    '水天需': '待时而动，如农盼甘霖。时机未至时急也无用，充实自我、耐心等待方为上策。',
    '天水讼': '争讼不宁，宜和解不宜对抗。口舌是非多，退一步海阔天空。慎始方能善终。',
    '地水师': '师出有名，众志成城。得此卦者利于团队协作，需有德高望重者统领，纪律严明则吉。',
    '水地比': '相亲相辅，团结和睦。人际关系融洽之时，利于合作结盟。真诚待人，自得贵人。',
    '风天小畜': '小有积蓄，但力量未足。如密云不雨，虽有所积累却尚未爆发。继续积累，稍安勿躁。',
    '天泽履': '如履虎尾，谨慎行事可无咎。位卑而处高位之下，言行需合乎礼仪规矩。',
    '地天泰': '天地交泰，否极泰来。上下通达、内外和谐之大吉卦。万事亨通，当顺势而为。',
    '天地否': '天地不交，闭塞不通。小人道长、君子道消之时。宜隐忍守正，韬光养晦，静待时机。',
    '天火同人': '志同道合，天下大同。利于合作、结盟、共事。以公心待人，则天下皆可同。',
    '火天大有': '大丰收之象，拥有者众。德配其位则吉，切忌骄奢。富足时当思回报社会。',
    '地山谦': '谦逊有礼，卑以自牧。六爻中最吉之卦，满招损而谦受益。谦虚者终获尊重。',
    '雷地豫': '安乐愉悦，但需防逸豫亡身。劳逸结合，适度享乐。利于建侯立业。',
    '泽雷随': '随顺时势，择善而从。不可固执己见，顺应变化方得亨通。跟对人、做对事。',
    '山风蛊': '积弊已久，需革故鼎新。旧有问题到了必须解决之时。勇于面对，拨乱反正。',
    '地泽临': '居高临下，亲临督导。好事将近，需亲力亲为。阳长阴消，积极进取。',
    '风地观': '观察审视，洞悉全局。宜多看少动，深入了解后再决策。上行下效，以身作则。',
    '火雷噬嗑': '咬合磨合，消除障碍。如口中含物，需用力咬碎。利用刑罚以正纲纪。',
    '山火贲': '文饰之美，外在光华。修饰、包装有其必要，但不宜过分。重实质不重形式。',
    '山地剥': '剥落衰败，小人得势。阳被阴剥，宜守不宜攻。厚下安宅，稳住根基。',
    '地雷复': '一阳来复，生机重现。冬至阳生，万物复苏。困境即将过去，回归正道则吉。',
    '天雷无妄': '真实无妄，不存侥幸。顺其自然，不强求不妄为。妄念则生灾，守正则吉。',
    '山天大畜': '大积蓄，厚积薄发。学识渊博、储备充足之时。利于进取，可涉大川。',
    '山雷颐': '颐养之道，养生养德。自食其力，谨言慎行。养正身心，吉。',
    '泽风大过': '过犹不及，阴阳失衡。如栋梁弯曲，需有独立不惧之勇气。大事当前，需果断担当。',
    '坎为水': '重险叠至，如涉深渊。处险境时，保持诚信之心，以常德化险。守正不阿可无咎。',
    '离为火': '光明依附，如火之丽于薪。柔顺中正，善于依附和照亮。利于培养柔顺之德。',
    '泽山咸': '感而遂通，心灵相通。感应之道贵在真诚。男女相感，婚姻吉。',
    '雷风恒': '恒久不变，持之以恒。长久之道在于中正。夫妇之道，贵在恒久。',
    '天山遁': '退避隐遁，远离是非。君子不立危墙之下。小利贞，宜守不宜进。',
    '雷天大壮': '声势浩大，过于强壮。强大之时需守正，非礼勿动。过刚易折，需懂收敛。',
    '火地晋': '旭日东升，步步高升。光明普照大地，前途一片光明。当自昭明德，积极向上。',
    '地火明夷': '光明被掩，身处黑暗。遭逢逆境时，坚守正道、隐忍待发。暗夜终将过去。',
    '风火家人': '家道端正，各司其职。家庭和睦则万事兴。言有物、行有恒，以身作则。',
    '火泽睽': '乖离不合，求同存异。分歧之时，小事尚可，大事难成。包容差异，寻找共识。',
    '水山蹇': '前有险阻，进退两难。遇困难时，反身修德、提升自我方为出路。',
    '雷水解': '解除困境，化险为夷。雷雨过后，天朗气清。既往不咎，向前看。',
    '山泽损': '损下益上，有舍有得。损己利人，终有所报。克制欲望、化解怒气则吉。',
    '风雷益': '损上益下，利益众生。利于行动进取，贵人相助。见善则迁，不断进步。',
    '泽天夬': '果断决断，当断则断。阳刚决去阴柔，大事当前需果断。但不可激进冒失。',
    '天风姤': '不期而遇，一阴始生。偶然相遇，需审慎对待。女壮不可娶（防小人得势）。',
    '泽地萃': '荟萃聚集，精英汇聚。人气聚集之时，利于组织活动、召集人才。',
    '地风升': '循序渐进，步步高升。如树木生长，自然而稳健。顺时而升，不可冒进。',
    '泽水困': '困穷受挫，有志难伸。身陷困境时，坚守信念方为出路。大器晚成，不言放弃。',
    '水风井': '如井养人，不变应万变。井虽不可移，却能持续滋养。坚守岗位，造福他人。',
    '泽火革': '变革维新，除旧布新。到了必须改变之时。顺应天时，勇于革新。',
    '火风鼎': '鼎立新局，革故鼎新。如烹小鲜，火候得当则美味。贤才得位，大吉。',
    '震为雷': '雷霆震动，惊惧修省。突如其来的变故令人惊惧，但事后悔改自省则吉。',
    '艮为山': '知止不殆，安守本分。如山静止，思不出其位。当止则止，不可贪进。',
    '风山渐': '循序渐进，水到渠成。如女子出嫁，步步为营。不可急于求成。',
    '雷泽归妹': '名不正则言不顺。婚嫁之事需合礼法，否则征凶。做事需名正言顺。',
    '雷火丰': '丰盛盈满，如日中天。鼎盛之时，当思患预防。盛极必衰，未雨绸缪。',
    '火山旅': '行旅在外，居无定所。漂泊不定时宜柔顺，小事可成大事不宜。过客心态，随遇而安。',
    '巽为风': '如风入物，柔顺谦逊。申命行事，令行禁止。谦逊使人信服。',
    '兑为泽': '悦泽和乐，朋友讲习。和颜悦色待人，人际关系和谐。分享快乐，共同进步。',
    '风水涣': '涣散分离，化散为聚。人心涣散时，需有凝聚力。以诚待人，聚沙成塔。',
    '水泽节': '节制有度，适可而止。凡事有度，过则成灾。制定规范，依序而行。',
    '风泽中孚': '诚信感天，如豚鱼之信。内心诚实，外化于行。诚信为本，利涉大川。',
    '雷山小过': '小有过越，过犹不及。小事可为，大事不宜。行事过于谦恭反而更好。',
    '水火既济': '大功告成，但要居安思危。初吉终乱，成功之时最需谨慎。思患预防。',
    '火水未济': '事业未成，尚在途中。如小狐过河，不可冒进。虽未完成，但前景可期。',
  };
  return map[name] || '';
}

// ====== Helpers ======

function getWuxingName(trigram: string): string {
  const map: Record<string, string> = {
    '乾': '金', '兑': '金', '离': '火', '震': '木',
    '巽': '木', '坎': '水', '艮': '土', '坤': '土',
  };
  return map[trigram] || '土';
}

function getDizhiWuxing(zhi: string): string {
  const map: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水',
  };
  return map[zhi] || '土';
}

function getWangshuaiDesc(ws: string): string {
  const map: Record<string, string> = {
    '旺': '（极旺，主事顺利）',
    '相': '（次旺，事有助力）',
    '休': '（平和，需待时机）',
    '囚': '（衰弱，事有阻碍）',
    '死': '（极衰，需加倍努力）',
  };
  return map[ws] || '';
}

function getShiYingRelation(shi: YaoLine, ying: YaoLine): string {
  const shiWx = shi.wuxing || '土';
  const yingWx = ying.wuxing || '土';

  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

  if (shiWx === yingWx) return '比和，世应五行相同，人事相应，吉。';
  if (sheng[shiWx] === yingWx) return '世生应，我去就人，事需主动。';
  if (sheng[yingWx] === shiWx) return '应生世，人来就我，吉。';
  if (ke[shiWx] === yingWx) return '世克应，我能制事，但需用力。';
  if (ke[yingWx] === shiWx) return '应克世，事来克我，不吉，需谨慎。';
  return '世应平和。';
}

function getWuxingRelWords(from: string, to: string): string {
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

  if (from === to) return '比和相助，吉利';
  if (sheng[from] === to) return '相生有情，吉利';
  if (sheng[to] === from) return '被生受助，亨通';
  if (ke[from] === to) return '相克制约，需防阻力';
  if (ke[to] === from) return '被克受制，有压力';
  return '关系平和中正';
}

function getYongShenScore(yongLines: YaoLine[], _monthZhi: string, _dayZhi: string): string {
  if (yongLines.length === 0) return '用神不上卦，所问之事根基薄弱。';

  const line = yongLines[0];
  const ws = line.wangshuai || '休';

  const scoreMap: Record<string, number> = { '旺': 5, '相': 4, '休': 3, '囚': 2, '死': 1 };
  const score = scoreMap[ws] || 3;

  if (line.isShi) return '用神持世，大吉之象！所问之事正应在我身，求之可得。';
  if (score >= 5) return '用神旺相，根基深厚，所求之事顺利可成。';
  if (score >= 4) return '用神有气，总体向好，需把握时机。';
  if (score >= 3) return '用神平和，需耐心等待，事有转机。';
  if (score >= 2) return '用神衰弱，当前时机不佳，建议暂缓或加倍努力。';
  return '用神死绝，所问之事困难重重，需三思而行。';
}

function getChangingInterpretation(
  _originalName: string,
  _changedName: string,
  changingLines: number[]
): string {
  const indices = changingLines.map((i) => i + 1).sort();

  if (indices.length === 1) {
    return `一爻独发，以本卦${POSITIONS[changingLines[0]]}爻辞为主断。动必有因，此爻是事情发展的关键。`;
  }
  if (indices.length === 2) {
    return `两爻齐动，以上爻为主、下爻为辅综合论断。阴阳升降，变动不居。`;
  }
  return `${indices.length}爻俱动，卦象变动较大，以变卦卦辞为主断，兼看本卦。事态变化多端。`;
}

function getLiuShouDesc(shou: string): string {
  const map: Record<string, string> = {
    '青龙': '主喜庆、婚姻、生育之喜。',
    '朱雀': '主口舌、文书、消息之事。',
    '勾陈': '主田土、牢狱、迟滞之事。',
    '螣蛇': '主虚惊、怪异、疑虑之事。',
    '白虎': '主凶丧、疾病、血光之事。',
    '玄武': '主盗贼、暗昧、隐私之事。',
  };
  return map[shou] || '';
}

function getConclusion(paiPan: PaiPanResult, _question: string): string {
  const { originalHexagram, changingLines, yongShen } = paiPan;
  const lines = originalHexagram.lines;
  const yongShenLines = lines.filter((l) => l.liuqin === yongShen.liuqin);
  const mainYong = yongShenLines[0];

  const parts: string[] = [];

  if (!mainYong) {
    parts.push(`卦中未见${yongShen.liuqin}爻，用神不上卦，说明所问之事在当前时机尚未显现。建议耐心等待，或重新审视问题的方向。`);
    return parts.join('\n');
  }

  const ws = mainYong.wangshuai || '休';
  const wsScoreMap: Record<string, string> = {
    '旺': '大吉',
    '相': '吉利',
    '休': '中平',
    '囚': '不吉',
    '死': '凶',
  };

  const overall = wsScoreMap[ws] || '中平';
  parts.push(`总体判断：${overall}。`);

  // 卦象解读（使用完整64卦映射）
  const detail = getHexagramDetail(originalHexagram.name);
  if (detail) {
    parts.push(detail);
  } else {
    parts.push(`得${originalHexagram.name}卦：${originalHexagram.description}`);
  }

  // 用神持世
  if (mainYong.isShi) {
    parts.push('用神持世，正应所求，说明此事与您直接相关，且主动权在您手中。');
  }

  // 动爻分析
  if (changingLines.length === 0) {
    parts.push('静卦无动，事态平稳，短期内不会有大的变化。');
  } else if (changingLines.length > 3) {
    parts.push('多爻发动，事态变化剧烈，可能出现意料之外的局面。');
  }

  return parts.join('\n');
}

function getAdvice(paiPan: PaiPanResult, _question: string): string {
  const { yongShen, changingLines, originalHexagram } = paiPan;
  const lines = originalHexagram.lines;
  const yongShenLines = lines.filter((l) => l.liuqin === yongShen.liuqin);
  const mainYong = yongShenLines[0];

  const advices: string[] = [];

  if (!mainYong) {
    advices.push('1. 用神不现，当前不宜贸然行动，建议先收集信息，等待最佳时机。');
    advices.push('2. 可过一段时间（如一旬之后）重新起卦，观其变化。');
    return advices.join('\n');
  }

  const ws = mainYong.wangshuai || '休';

  if (ws === '旺') {
    advices.push('1. 用神旺相，时机成熟，应果断行动，不宜犹豫。');
    advices.push('2. 顺势而为，充分发挥现有优势，事半功倍。');
  } else if (ws === '相') {
    advices.push('1. 用神有气，行动方向正确，但需注意节奏的把控。');
    advices.push('2. 可借助贵人力量，团队合作更易见效。');
  } else if (ws === '休') {
    advices.push('1. 用神平和，建议以守为主，不要操之过急。');
    advices.push('2. 在等待中做好准备工作，等待时机成熟后再行动。');
  } else {
    advices.push('1. 用神衰弱，当前并非最佳行动时机。建议暂缓计划，重新评估。');
    advices.push('2. 可考虑调整策略方向，或寻求更有经验的顾问帮助。');
  }

  // 根据卦象增加具体建议
  const specificAdvice = getHexagramSpecificAdvice(originalHexagram.name);
  if (specificAdvice) {
    advices.push(`3. ${specificAdvice}`);
  }

  if (changingLines.length > 0) {
    advices.push('4. 卦中有动爻，说明事有变数。关注动爻方向的指引，灵活应对变化。');
  }

  advices.push(`${advices.length + 1}. 无论卦象如何，保持积极心态和理性判断，方为处世之道。`);

  return advices.join('\n');
}

/** 各卦的具体行动建议 */
function getHexagramSpecificAdvice(name: string): string {
  const map: Record<string, string> = {
    '乾为天': '自强不息，主动出击。领导力是你的核心优势，积极作为必有所获。',
    '坤为地': '厚德载物，以柔克刚。不必急于争先，顺从大势反而能收获更多。',
    '水雷屯': '万事开头难，多一分耐心就多一分胜算。先打好基础，勿急于求成。',
    '山水蒙': '虚心请教他人，不要不懂装懂。启蒙之道在于放下身段、潜心学习。',
    '水天需': '等待也是一种智慧。利用等待的时间充实自己，时机一到自然水到渠成。',
    '天水讼': '避免与人争执，退一步海阔天空。与其争一时之气，不如争长久之利。',
    '地水师': '团结力量大，找对带头人很重要。团队协作中服从统一指挥更易成功。',
    '水地比': '多结交良师益友，真诚待人。人际关系将是你的最大助力。',
    '风天小畜': '继续积累，不要急于表现。量变终将引发质变，坚定信心不动摇。',
    '天泽履': '步步为营，小心行得万年船。遵守规则，举止得体，则险境可安度。',
    '地天泰': '乘势而上，良机难得。当下正是黄金时期，大胆行动、尽情施展。',
    '天地否': '韬光养晦，不宜出头。此时低调蓄力比高调行动更明智。',
    '天火同人': '寻求志同道合的伙伴，众人拾柴火焰高。合作共赢是通往成功的捷径。',
    '火天大有': '丰收季节，但需戒骄戒躁。常怀谦卑之心才能守住已有的成就。',
    '地山谦': '继续保持谦虚低调的姿态，越谦逊越能赢得尊重和机会。',
    '雷地豫': '适度享受无可厚非，但不可纵情享乐。劳逸结合才是长久之道。',
    '泽雷随': '顺势而为是智慧，择善而从是能力。跟随靠谱的人做靠谱的事。',
    '山风蛊': '积弊当除，拿出勇气面对历史遗留问题。彻底改革比修修补补更有价值。',
    '地泽临': '亲力亲为，以身作则。好事将近，保持积极进取的姿态。',
    '风地观': '多看多听少说少动。先全面了解情况再做决策，不要盲目出手。',
    '火雷噬嗑': '果断处理问题，不要让它继续恶化。快刀斩乱麻比拖泥带水强。',
    '山火贲': '适度包装是必要的，但不要华而不实。内容永远比形式重要。',
    '山地剥': '守住基本盘，不要冒险扩张。根基稳固是第一要务。',
    '地雷复': '新的开始就在前方。吸取教训、调整方向，一切都在向好的方向转化。',
    '天雷无妄': '不要抱有侥幸心理，脚踏实地最可靠。诚实做事，结果自然显现。',
    '山天大畜': '厚积薄发的时刻到了。之前的积累已经足够，可以放开手脚大干一场。',
    '山雷颐': '关注身心健康，养精蓄锐。身体是革命的本钱，先照顾好自己的身心。',
    '泽风大过': '关键时刻需要担当。不惧独立，该站出来的时候就要勇敢站出来。',
    '坎为水': '身处险境，诚信是护身符。守正不阿，以不变应万变，终能化险为夷。',
    '离为火': '找到可以依附的力量，借力而为。柔顺中正的态度会为你赢得支持。',
    '泽山咸': '以诚待人，用心去感受。无论是感情还是合作，真诚是最好的桥梁。',
    '雷风恒': '贵在坚持，不要轻易改变方向。恒久的力量比短暂的热情更强大。',
    '天山遁': '暂时退避不是懦弱。远离是非之地，保存实力，静待转机。',
    '雷天大壮': '强大时更要保持克制和正派。暴力不可恃，德才是真正的力量。',
    '火地晋': '前途光明，当奋力向前。充分发挥你的才华和热情，大好时机稍纵即逝。',
    '地火明夷': '身处黑暗但要心中有光。坚守底线、等待黎明，逆境终将过去。',
    '风火家人': '家庭和睦是最大的财富。以规矩立家，以爱心维系亲情。',
    '火泽睽': '求同存异，包容差异。小分歧不要影响大局，学会与不同的人合作。',
    '水山蹇': '遇到困难时向内求索。反思自己、提升能力，比抱怨外部环境更有用。',
    '雷水解': '困难已经过去，恩怨一笔勾销。放下包袱，轻装上阵。',
    '山泽损': '有舍才有得。适度的牺牲和付出，终将换来更大的回报。',
    '风雷益': '利人利己的事大胆去做。帮助他人也是帮助自己，共赢是最高境界。',
    '泽天夬': '当断不断反受其乱。关键时刻需要下定决心，果断行动。',
    '天风姤': '突如其来的机遇或人，需要审慎判断。不是所有邂逅都是善缘。',
    '泽地萃': '积极社交、聚集人气的好时机。人脉即资源，广结善缘必有回报。',
    '地风升': '一步一个脚印向上走。不要跳级，扎扎实实的成长最为可靠。',
    '泽水困': '困境是暂时的，信念是一生的。咬牙坚持下去，黑暗过后就是黎明。',
    '水风井': '坚守岗位就是最大的贡献。在自己的位置上做到极致，你就是不可或缺的。',
    '泽火革': '拥抱变化、主动变革。与其被改变，不如主动求变。',
    '火风鼎': '建立系统、培养人才。一个好的制度或框架比个人能力更重要。',
    '震为雷': '遇到变故时先冷静下来。恐惧修正之后，理智自然会回归。',
    '艮为山': '知止是一种高级智慧。做自己该做的事，不去觊觎超出范围的东西。',
    '风山渐': '慢慢来反而比较快。按部就班走下去，终会到达想去的地方。',
    '雷泽归妹': '做事要名正言顺，程序合规很重要。不符合规矩的事容易后患无穷。',
    '雷火丰': '顶峰之时，安全比增长更重要。留足余粮，防备未来的不确定。',
    '火山旅': '漂泊期宜柔不宜刚。陌生的环境里，谦虚低调让你走得更远。',
    '巽为风': '以柔克刚，润物细无声。谦虚的态度和持续的沟通比强制命令更有效。',
    '兑为泽': '快乐要与人分享。和朋友交流学习，愉悦的氛围能让创造力倍增。',
    '风水涣': '凝聚人心是当务之急。用共同的愿景和目标把大家重新团结起来。',
    '水泽节': '凡事有度，过欲则损。学会自我约束，建立健康的生活和工作节律。',
    '风泽中孚': '诚信是你的通行证。说到做到、表里如一，好运自会找上门来。',
    '雷山小过': '在小事上可以稍微过度，大事上务必严谨。细节之处多花心思无妨。',
    '水火既济': '庆祝成功的同时别忘了防患未然。初吉终乱，居安思危才能长治久安。',
    '火水未济': '虽然还未成功，但方向是对的。保持耐心，小心谨慎地走完最后一程。',
  };
  return map[name] || '';
}
