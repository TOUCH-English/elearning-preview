/* =============================================================================
   TouchLesson — the lesson engine every leveled course runs (shared/lesson-engine.js)
   -----------------------------------------------------------------------------
   One engine, many courses (2026-09-25). Until then each course carried its own copy of
   this code inside its index.html; Level 1 fell a whole redesign behind Pre-Beginner that
   way, and every fix had to be made three times. Now a course page holds only what is its
   own, in an inline <script> BEFORE this file:

     const CONF = { id, name, label, next, level, idb, flow, ui:{zh,ms,en} };
     const COURSE = [...];          // units → lessons (tools/build-audio.mjs reads it there)
     const LESSON_EXTRA = {...};    // goal cards, SAY IT YOURSELF (one line, script-replaced)
     const NOSPEAK = new Set([...]);// deliberately wrong options that must never be spoken

   CONF.flow picks the lesson shape in buildLessonSteps() ("pb" Pre-Beginner, "l1" Level 1).
   CONF.ui overrides UI strings that name the course. The styles are shared/lesson.css.
   Top-level const/let in one classic <script> are visible to the next, which is all this
   relies on — no modules, no build step, same as the rest of shared/.
============================================================================= */

/* ---------- UI strings ---------- */
const UI = {
 zh:{continue:"Continue",check:"Check",start:"Start",resume:"Resume",startLesson:"Start Lesson",correct:"Correct!",wrong:"Not quite",answerIs:"Correct answer:",vocab:"Vocabulary",patterns:"Sentence Patterns",fill:"Fill in the Blank",sub:"Substitution",order:"Word Order",trans:"Translation",mcq:"Multiple Choice",dialog:"Dialogue",boss:"BOSS CHALLENGE",lessonDone:"Lesson Complete!",bossDone:"Boss Defeated!",resSub:"Lesson complete. Next lesson unlocked.",accuracy:"Accuracy",locked:"Locked",done:"Done",go:"In progress",new:"Start",lesson:"Lesson",lessonU:"",module:"Module",bonus:"Completion bonus",bossBonus:"Boss bonus",heroNew:"Start your English journey here.",heroCont:"Continue where you left off.",allDone:"Congratulations! You finished the whole Pre-Beginner Level! 🎉",step:"Step",sceneLbl:"Scene",alsoCorrect:"也可以这样说：",practised:"已练习",practisedTitle:"已练习，还没过关",needPass:"答对 {p}% 才算过关（这次 {a}%）。这一课先记为「已练习」，随时可以再做一次！（最后「再练一次」答对的题，算半题。）",needPassDone:"答对 {p}% 才算过关（这次 {a}%）。你之前已经过关，进度不会受影响。",retryLesson:"↻ 再做一次这一课",you:"You",changeLang:"Change explanation language?",menuTitle:"Menu",cancel:"Close",saveLocal:"Save to Device",quitYes:"Quit",quitNo:"Keep Learning",soundOn:"🔊 Sound on",soundOff:"🔇 Sound off",reviewLbl:"Today's Review",reviewN:"{n} questions to review",reviewNow:"Review",allCaught:"All caught up 🎉",noReview:"No review needed right now.",reviewDone:"Review Complete!",clearedMsg:"{c} cleared · {r} still to review.",reviewAgain:"Keep Reviewing",mistakes:"Mistakes to Review",praise:["Correct!","Excellent!","Great job!","Perfect!","Keep it up!"],combo:"Combo",nextUp:"Next",backHome:"Home",dailyGoal:"Daily Goal",goalDone:"🎉 Daily goal reached!",courseProg:"Course Progress",streakMile:"🔥 {n} days in a row! Amazing!",navHome:"Map",navProfile:"Profile",achTitle:"Achievements",statLessons:"Lessons",statStreak:"Day Streak",student:"Touch Student",editName:"Edit name",saveName:"Save",cpSub:"Pre-Beginner Level",startFlag:"START HERE",toNext:"{n} XP to Lv {lv}",xtGrowth:"成长树",xtNext:"再得 {n} XP 长成{name}",xtMax:"已长成大树，了不起！🌳",listen:"Listening Match",meaningIs:"Meaning:",nlTag:"Next Level",nlLocked:"Locked · {n}/25 lessons",nlSoon:"Coming soon 🎉",obTitle:"Welcome! 👋",obSkip:"Skip",speakTitle:"Speak Up",record:"Record",stopBtn:"Stop",play:"Play",tryAgain:"Try Again",speakSay:"Say this sentence:",recState:"Recording…",getReady:"Get ready…",speakNow:"Speak now!",saving:"Saving…",offTitle:"Recommended learning path",offGo:"Continue",offBack:"Go Back",vocabSub:"先认读这些单词，再继续。",tapSpk:"点喇叭按钮听单词发音；点选词块时也会自动朗读。",patternsSub:"___ 是可替换的位置。",fillSub:"选出正确的词。",subSub:"点选一个词或词组，放进句型。",subBuilt:"很好！你造了这个句子：",orderSub:"点击单词，排出正确顺序。",transSub:"把句子翻译成英文（点词组句）。",mcqSub:"选出最合适的答案。",dialogSub:"点词组句，完成你的台词。",bossSub:"无提示！靠自己完成对话。",reviewFrom:"来自你之前做错的题目，答对后会从这里移除。",quit:"退出本关？本关进度不会保存。",menuSub:"切换解释语言，或把进度保存到本设备（进度也会自动保存）。",saved:"✓ 已保存到本设备（刷新后会恢复）",savedMem:"已保存到本次会话（此浏览器不支持本地存储）",listenSub:"点喇叭听发音，再点对应的英文单词，把它们配对。",nlDesc:"进入 Level 1 后，你会学习更多日常交流表达。从“跟着说”，慢慢进入“自己说简单句子”。",nlToastLocked:"完成全部 25 关即可解锁 Level 1。继续加油！",nlToastSoon:"🎉 你已完成 Pre-Beginner！Level 1 正在制作中，敬请期待。",obSub:"我们要怎么称呼你？你的名字会出现在练习里（例如 My name is …），之后也可以在 Profile 里修改。",obHello:"你好，{name}！",listenMuted:"声音已关闭，本听力练习已跳过。想练听力可在右上角打开声音。",speakSub:"先开口说，再听听自己的声音；想重来就再录一次。不评分、不上传，录音只保存在你自己的设备里。",speakDenied:"无法使用麦克风（可能未授权）。没关系，点 Continue 继续，不影响通关。",speakSaved:"✓ 已录好，保存在本机。点 Play 听听自己的发音！",speakSavedHint:"找到你上次的录音了，点 Play 可以回听，或再录一次。",speakWaitHint:"按 Record 后先别说话——看到 “Speak now” 再开始说，录音会更完整。",hearModel:"▶ 先听一次示范",hearHint:"学生开口前一定要先听过：听 → 自己念 → 播自己的 → 再听示范对照。",offSub:"按顺序学习效果最好，下面是建议的路线：",offFree:"你可以自由探索这一关 😊 慢慢学，没问题。"},
 ms:{continue:"Continue",check:"Check",start:"Start",resume:"Resume",startLesson:"Start Lesson",correct:"Correct!",wrong:"Not quite",answerIs:"Correct answer:",vocab:"Vocabulary",patterns:"Sentence Patterns",fill:"Fill in the Blank",sub:"Substitution",order:"Word Order",trans:"Translation",mcq:"Multiple Choice",dialog:"Dialogue",boss:"BOSS CHALLENGE",lessonDone:"Lesson Complete!",bossDone:"Boss Defeated!",resSub:"Lesson complete. Next lesson unlocked.",accuracy:"Accuracy",locked:"Locked",done:"Done",go:"In progress",new:"Start",lesson:"Lesson",lessonU:"",module:"Module",bonus:"Completion bonus",bossBonus:"Boss bonus",heroNew:"Start your English journey here.",heroCont:"Continue where you left off.",allDone:"Congratulations! You finished the whole Pre-Beginner Level! 🎉",step:"Step",sceneLbl:"Scene",alsoCorrect:"Boleh juga dikatakan:",practised:"Sudah berlatih",practisedTitle:"Sudah berlatih — belum lulus",needPass:"Anda perlu {p}% betul untuk lulus (kali ini {a}%). Pelajaran ini ditanda 'Sudah berlatih' — cuba lagi bila-bila masa! (Soalan yang betul semasa “Cuba sekali lagi” dikira separuh.)",needPassDone:"Anda perlu {p}% betul untuk lulus (kali ini {a}%). Anda sudah lulus sebelum ini, jadi kemajuan anda kekal.",retryLesson:"↻ Ulang pelajaran ini",you:"You",changeLang:"Change explanation language?",menuTitle:"Menu",cancel:"Close",saveLocal:"Save to Device",quitYes:"Quit",quitNo:"Keep Learning",soundOn:"🔊 Sound on",soundOff:"🔇 Sound off",reviewLbl:"Today's Review",reviewN:"{n} questions to review",reviewNow:"Review",allCaught:"All caught up 🎉",noReview:"No review needed right now.",reviewDone:"Review Complete!",clearedMsg:"{c} cleared · {r} still to review.",reviewAgain:"Keep Reviewing",mistakes:"Mistakes to Review",praise:["Correct!","Excellent!","Great job!","Perfect!","Keep it up!"],combo:"Combo",nextUp:"Next",backHome:"Home",dailyGoal:"Daily Goal",goalDone:"🎉 Daily goal reached!",courseProg:"Course Progress",streakMile:"🔥 {n} days in a row! Amazing!",navHome:"Map",navProfile:"Profile",achTitle:"Achievements",statLessons:"Lessons",statStreak:"Day Streak",student:"Touch Student",editName:"Edit name",saveName:"Save",cpSub:"Pre-Beginner Level",startFlag:"START HERE",toNext:"{n} XP to Lv {lv}",xtGrowth:"Pokok",xtNext:"{n} XP lagi untuk menjadi {name}",xtMax:"Sudah jadi pokok besar — hebat! 🌳",listen:"Listening Match",meaningIs:"Meaning:",nlTag:"Next Level",nlLocked:"Locked · {n}/25 lessons",nlSoon:"Coming soon 🎉",obTitle:"Welcome! 👋",obSkip:"Skip",speakTitle:"Speak Up",record:"Record",stopBtn:"Stop",play:"Play",tryAgain:"Try Again",speakSay:"Say this sentence:",recState:"Recording…",getReady:"Get ready…",speakNow:"Speak now!",saving:"Saving…",offTitle:"Recommended learning path",offGo:"Continue",offBack:"Go Back",vocabSub:"Baca dan ingat perkataan ini dahulu.",tapSpk:"Tekan butang pembesar suara untuk dengar sebutan; perkataan juga dibaca apabila ditekan.",patternsSub:"___ ialah slot yang boleh diganti.",fillSub:"Pilih perkataan yang betul.",subSub:"Tekan satu perkataan atau frasa untuk dimasukkan ke dalam pola.",subBuilt:"Bagus! Anda membina ayat ini:",orderSub:"Tekan perkataan mengikut susunan yang betul.",transSub:"Terjemah ke Bahasa Inggeris (tekan perkataan).",mcqSub:"Pilih jawapan yang paling sesuai.",dialogSub:"Tekan perkataan untuk melengkapkan dialog anda.",bossSub:"Tiada petunjuk! Lengkapkan dialog sendiri.",reviewFrom:"Daripada jawapan yang anda silap; jawab betul untuk mengeluarkannya.",quit:"Keluar? Kemajuan pelajaran ini tidak disimpan.",menuSub:"Tukar bahasa penerangan atau simpan kemajuan ke peranti ini (kemajuan juga disimpan secara automatik).",saved:"✓ Disimpan ke peranti ini (kekal selepas muat semula)",savedMem:"Disimpan untuk sesi ini sahaja (pelayar tidak menyokong storan)",listenSub:"Tekan pembesar suara untuk dengar, kemudian tekan perkataan Inggeris yang sepadan.",nlDesc:"Dalam Level 1, anda akan belajar komunikasi harian yang mudah. Anda akan mula daripada ikut sebut kepada membina ayat mudah sendiri.",nlToastLocked:"Tamatkan semua 25 pelajaran untuk membuka Level 1. Teruskan!",nlToastSoon:"🎉 Anda telah tamat Pre-Beginner! Level 1 sedang dibina.",obSub:"Apa nama anda? Nama anda akan muncul dalam latihan (cth. My name is …). Anda boleh menukarnya di Profile bila-bila masa.",obHello:"Hai, {name}!",listenMuted:"Bunyi dimatikan, latihan mendengar ini dilangkau. Hidupkan bunyi di penjuru atas untuk mencubanya.",speakSub:"Cakap dahulu, kemudian dengar suara anda sendiri; rakam semula jika mahu. Tiada markah, tiada muat naik — rakaman disimpan dalam peranti anda sahaja.",speakDenied:"Mikrofon tidak dapat digunakan (mungkin tiada kebenaran). Tidak mengapa, tekan Continue untuk teruskan.",speakSaved:"✓ Rakaman disimpan dalam peranti ini. Tekan Play untuk dengar sebutan anda!",speakSavedHint:"Rakaman lepas anda dijumpai. Tekan Play untuk dengar, atau rakam semula.",speakWaitHint:"Selepas tekan Record, tunggu dahulu — mula bercakap hanya apabila “Speak now” muncul supaya rakaman lengkap.",hearModel:"▶ Dengar contoh dulu",hearHint:"Dengar dahulu, kemudian cakap, main semula, dan bandingkan dengan contoh.",offSub:"Belajar mengikut urutan paling berkesan. Ini laluan yang dicadangkan:",offFree:"Anda masih boleh meneroka pelajaran ini 😊 Belajar perlahan-lahan, tiada masalah."},
 en:{continue:"Continue",check:"Check",start:"Start",resume:"Resume",startLesson:"Start Lesson",correct:"Correct!",wrong:"Not quite",answerIs:"Correct answer:",vocab:"Vocabulary",patterns:"Sentence Patterns",fill:"Fill in the Blank",sub:"Substitution",order:"Word Order",trans:"Translation",mcq:"Multiple Choice",dialog:"Dialogue",boss:"BOSS CHALLENGE",lessonDone:"Lesson Complete!",bossDone:"Boss Defeated!",resSub:"Lesson complete. Next lesson unlocked.",accuracy:"Accuracy",locked:"Locked",done:"Done",go:"In progress",new:"Start",lesson:"Lesson",lessonU:"",module:"Module",bonus:"Completion bonus",bossBonus:"Boss bonus",heroNew:"Start your English journey here.",heroCont:"Continue where you left off.",allDone:"Congratulations! You finished the whole Pre-Beginner Level! 🎉",step:"Step",sceneLbl:"Scene",alsoCorrect:"Also correct:",practised:"Practised",practisedTitle:"Practised — not passed yet",needPass:"You need {p}% correct to pass (this time: {a}%). This lesson is marked 'Practised' — try it again any time! (Questions you get right in “One more time” count as half.)",needPassDone:"You need {p}% correct to pass (this time: {a}%). You passed this lesson before, so your progress is kept.",retryLesson:"↻ Try this lesson again",you:"You",changeLang:"Change explanation language?",menuTitle:"Menu",cancel:"Close",saveLocal:"Save to Device",quitYes:"Quit",quitNo:"Keep Learning",soundOn:"🔊 Sound on",soundOff:"🔇 Sound off",reviewLbl:"Today's Review",reviewN:"{n} questions to review",reviewNow:"Review",allCaught:"All caught up 🎉",noReview:"No review needed right now.",reviewDone:"Review Complete!",clearedMsg:"{c} cleared · {r} still to review.",reviewAgain:"Keep Reviewing",mistakes:"Mistakes to Review",praise:["Correct!","Excellent!","Great job!","Perfect!","Keep it up!"],combo:"Combo",nextUp:"Next",backHome:"Home",dailyGoal:"Daily Goal",goalDone:"🎉 Daily goal reached!",courseProg:"Course Progress",streakMile:"🔥 {n} days in a row! Amazing!",navHome:"Map",navProfile:"Profile",achTitle:"Achievements",statLessons:"Lessons",statStreak:"Day Streak",student:"Touch Student",editName:"Edit name",saveName:"Save",cpSub:"Pre-Beginner Level",startFlag:"START HERE",toNext:"{n} XP to Lv {lv}",xtGrowth:"Growth Tree",xtNext:"{n} XP to grow into {name}",xtMax:"Fully grown — amazing! 🌳",listen:"Listening Match",meaningIs:"Meaning:",nlTag:"Next Level",nlLocked:"Locked · {n}/25 lessons",nlSoon:"Coming soon 🎉",obTitle:"Welcome! 👋",obSkip:"Skip",speakTitle:"Speak Up",record:"Record",stopBtn:"Stop",play:"Play",tryAgain:"Try Again",speakSay:"Say this sentence:",recState:"Recording…",getReady:"Get ready…",speakNow:"Speak now!",saving:"Saving…",offTitle:"Recommended learning path",offGo:"Continue",offBack:"Go Back",vocabSub:"Read and remember these words first.",tapSpk:"Tap the speaker button to hear the word; words are also spoken when you tap them.",patternsSub:"___ is a slot you can replace.",fillSub:"Choose the correct word.",subSub:"Tap a word or phrase to put into the pattern.",subBuilt:"Good! You made this sentence:",orderSub:"Tap the words in the correct order.",transSub:"Translate into English (tap the words).",mcqSub:"Choose the best answer.",dialogSub:"Tap the words to finish your line.",bossSub:"No hints! Finish the dialogue by yourself.",reviewFrom:"From answers you missed; answer correctly to clear them.",quit:"Quit this lesson? Progress will not be saved.",menuSub:"Change the explanation language or save progress to this device (progress also saves automatically).",saved:"✓ Saved to this device (kept after refresh)",savedMem:"Saved for this session only (browser storage unavailable)",listenSub:"Tap a speaker to listen, then tap the matching English word.",nlDesc:"In Level 1, you will learn simple daily communication. You will move from repeating to making simple sentences.",nlToastLocked:"Complete all 25 lessons to unlock Level 1. Keep going!",nlToastSoon:"🎉 You finished Pre-Beginner! Level 1 is coming soon.",obSub:"What should we call you? Your name will appear inside the exercises (e.g. My name is …). You can change it in Profile anytime.",obHello:"Hello, {name}!",listenMuted:"Sound is off, so this listening exercise is skipped. Turn sound on (top right) to try it.",speakSub:"Speak first. Listen to yourself. Try again if you want. No score, no upload — your recording stays on your own device.",speakDenied:"Microphone unavailable (permission may be blocked). No problem — tap Continue to move on.",speakSaved:"✓ Recorded and saved on this device. Tap Play to hear yourself!",speakSavedHint:"Found your last recording. Tap Play to listen, or record again.",speakWaitHint:"Wait for “Speak now” before speaking — your recording will be complete.",hearModel:"▶ Hear it first",hearHint:"Listen first, then say it, play yourself back, and compare with the model.",offSub:"Learning in order works best. Here is the recommended path:",offFree:"You can still explore this lesson 😊 Learn at your own pace."}
};
/* Words for the redesigned lesson (2026-09-25), merged into UI so T() finds them. */
const UI_LESSON = {
 zh:{goalK:"这一课的目标",goalTime:"⏱ 大约 5 分钟",goalGo:"开始",meetK:"新单词",meetSub:"点 🔊 听发音，看看怎么用。",hearK:"听一听",hearQ:"你听到哪一个词？",hearSlow:"慢速",
  repeatK:"跟着说",repeatSub:"先听示范，再按麦克风说一遍。",hearModel2:"再听一次",micTap:"点麦克风，开始说",listening:"正在听……",spGood:"很好！每个词都听清楚了。",spMiss:"标红的词没听清楚，再试一次。",spNone:"没听到声音，再试一次。",spMoveOn:"没关系，可以继续了。",spLater:"现在不方便说",spFallback:"这台装置听不懂语音，改成录下来、自己听。",sayAloud:"大声念一遍，再按 Continue。",
  ownK:"自己说说看",ownHeard:"我听到：",ownGood:"说得好！",ownRetry:"差一点——试着用这一课的句子回答。",ownHint:"提示：",ownFallback:"用这一课的句子回答。",
  reviewTag:"复习 · 第 {l} 课",reviewTagU:"复习 · 第 {u} 单元第 {l} 课",reviewTagB:"复习 · 第 {u} 单元 Boss",redoTag:"再练一次",
  fbRight:"答对了！",fbAnswer:"正确答案：",fbPooled:"这题会放进你的复习",fbEasy:"太简单",fbHard:"太难",fbFlag:"报错",noted:"已记下",undo:"撤销",
  repTitle:"这一题有什么问题？",repReasons:["我的答案应该也算对","发音听起来不对","题目或说明看不懂","其他"],repCancel:"取消",repSend:"送出",repSent:"谢谢，已送出",
  redoDone:"刚才错的 {n} 题已经再练过",hearIs:"{w} ＝ {g}"},
 ms:{goalK:"Matlamat pelajaran ini",goalTime:"⏱ Kira-kira 5 minit",goalGo:"Mula",meetK:"Perkataan baharu",meetSub:"Tekan 🔊 untuk dengar, dan lihat cara menggunakannya.",hearK:"Dengar",hearQ:"Perkataan mana yang anda dengar?",hearSlow:"Perlahan",
  repeatK:"Ikut sebut",repeatSub:"Dengar contoh, kemudian tekan mikrofon dan sebut.",hearModel2:"Dengar lagi",micTap:"Tekan mikrofon dan bercakap",listening:"Sedang mendengar…",spGood:"Bagus! Semua perkataan jelas.",spMiss:"Perkataan merah kurang jelas. Cuba lagi.",spNone:"Tiada suara didengar. Cuba lagi.",spMoveOn:"Tidak mengapa, anda boleh teruskan.",spLater:"Tak boleh bercakap sekarang",spFallback:"Peranti ini tidak dapat mengecam suara — rakam dan dengar sendiri.",sayAloud:"Sebut dengan kuat, kemudian tekan Continue.",
  ownK:"Cakap sendiri",ownHeard:"Saya dengar:",ownGood:"Bagus!",ownRetry:"Hampir! Cuba jawab dengan ayat pelajaran ini.",ownHint:"Petunjuk:",ownFallback:"Jawab dengan ayat pelajaran ini.",
  reviewTag:"Ulang kaji · Pelajaran {l}",reviewTagU:"Ulang kaji · Unit {u} Pelajaran {l}",reviewTagB:"Ulang kaji · Unit {u} Boss",redoTag:"Cuba sekali lagi",
  fbRight:"Betul!",fbAnswer:"Jawapan betul:",fbPooled:"Soalan ini akan masuk ulang kaji anda",fbEasy:"Mudah",fbHard:"Susah",fbFlag:"Lapor",noted:"Dicatat",undo:"Batal",
  repTitle:"Apa masalah soalan ini?",repReasons:["Jawapan saya patut dikira betul","Sebutan kedengaran salah","Soalan atau penerangan tidak jelas","Lain-lain"],repCancel:"Batal",repSend:"Hantar",repSent:"Terima kasih, sudah dihantar",
  redoDone:"{n} soalan yang salah tadi sudah dilatih semula",hearIs:"{w} = {g}"},
 en:{goalK:"In this lesson",goalTime:"⏱ About 5 minutes",goalGo:"Start",meetK:"New words",meetSub:"Tap 🔊 to hear each word and see how it is used.",hearK:"Listen",hearQ:"Which word do you hear?",hearSlow:"Slow",
  repeatK:"Say it after me",repeatSub:"Listen first, then tap the mic and say it.",hearModel2:"Hear it again",micTap:"Tap the mic and speak",listening:"Listening…",spGood:"Great! Every word came through.",spMiss:"The red words did not come through. Try again.",spNone:"I didn't hear anything. Try again.",spMoveOn:"That's fine — you can move on.",spLater:"Can't speak now",spFallback:"This device can't recognise speech — record yourself and listen instead.",sayAloud:"Say it out loud, then tap Continue.",
  ownK:"Say it yourself",ownHeard:"I heard:",ownGood:"Well said!",ownRetry:"Almost — try answering with this lesson's sentence.",ownHint:"Hint:",ownFallback:"Answer with this lesson's sentence.",
  reviewTag:"Review · Lesson {l}",reviewTagU:"Review · Unit {u} Lesson {l}",reviewTagB:"Review · Unit {u} Boss",redoTag:"One more time",
  fbRight:"Correct!",fbAnswer:"Correct answer:",fbPooled:"This one goes into your review",fbEasy:"Too easy",fbHard:"Too hard",fbFlag:"Report",noted:"Noted",undo:"Undo",
  repTitle:"What is wrong with this question?",repReasons:["My answer should be accepted","The audio sounds wrong","I don't understand the question","Something else"],repCancel:"Cancel",repSend:"Send",repSent:"Thanks — sent",
  redoDone:"You practised the {n} you missed once more",hearIs:"{w} = {g}"}
};
Object.keys(UI_LESSON).forEach(k=>Object.assign(UI[k], UI_LESSON[k]));
/* Level 1 screens (2026-09-25) */
const UI_L1 = {
 zh:{gistK:"先听一段对话",gistSub:"没有字，只用听的。听完回答下面的问题。",gistPlay:"▶ 播放对话",gistStop:"■ 停止",
  loK:"只听不看",loSub:"听这一句（没有字），然后回答。",loWas:"刚才那一句是：",
  stransK:"用英文说出来",stransSub:"看中文，按麦克风用英文说出来。",stransAns:"可以这样说：",stransRetry:"还不太对。想一想，再说一次。",ownAskRetry:"差一点——要用问句问 {who}。",compareModel:"对照一下示范：",ownNot:"这里不能说「{w}」——这正是这一课要改的说法，再说一次。",ownShort:"请用一句完整的英文回答，不要只说一个字。",missionOff:"要说的是上面这个题目——多用题目里的事来说。",stransSubL2:"看情境，按麦克风用英文说出来——用你自己的话也可以。",ownMust:"还要说出这一部分：{w}…，再说一次。",slipTip:"小提醒：{t}",planStory:"开口前先想 15 秒：先发生什么？然后呢？结果怎样？",planPPF:"开口前先想 15 秒：重点是什么？为什么？下一步是什么？",planLoop:"开口前先想 15 秒：怎么回答？加什么细节？反问什么？",ownAskAux:"问句里少了一个字：例如 Where DO you…? / How ARE you…?，再问一次。",ownAskTopic:"是问句没错，不过要问题目要你问的那件事，再试一次。",dlgSay:"这一句用说的：按麦克风，把它说出来。",
  wholeK:"一次说完整",missionK:"Boss 任务：连说几句",missionSub:"按麦克风，一口气说完；说完再按一下。",missionModel:"看示范",missionHide:"收起示范",missionRetry:"再说完整一点——把上面要求的每一样都说到。",missionNeed:"至少说 {n} 个英文单词",missionGaps:"还缺：{g}。",missionShort:"你说了 {n} 个英文单词，至少要 {m} 个。",
  whyFact:"注意：这里要说 {w}。再说一次。",whySmall:"少了一个小字：{w}。英文句子里这种字不能省，再说一次。",whyForm:"注意词尾：这里要说 {w}。再说一次。",whyMissing:"红色的字漏掉了或没听清楚，再说一次。",
  skippedN:"这一课你跳过了 {n} 个开口／听力练习——方便的时候再做一次。",missionGood:"任务完成！说得很完整。",missionS1:"先看上面的要求，想好要说的每一样",
  resumeQ:"上次这一课做到第 {n} 步，要接着做吗？",resumeYes:"接着做",resumeNo:"重新开始",
  roleNote:"练习对话：句子里的年龄、地方照题目说就好，不一定是你自己的情况。",gistEase:"听不懂也没关系，先猜猜看——等一下会学到这些字。"},
 ms:{gistK:"Dengar perbualan dahulu",gistSub:"Tiada teks — dengar sahaja, kemudian jawab soalan di bawah.",gistPlay:"▶ Main perbualan",gistStop:"■ Berhenti",
  loK:"Dengar sahaja",loSub:"Dengar ayat ini (tiada teks), kemudian jawab.",loWas:"Ayat tadi ialah:",
  stransK:"Sebut dalam Bahasa Inggeris",stransSub:"Baca ayat ini, tekan mikrofon dan sebut dalam Bahasa Inggeris.",stransAns:"Boleh sebut begini:",stransRetry:"Belum tepat. Fikir sekejap, kemudian cuba lagi.",ownAskRetry:"Hampir — tanya {who} dengan soalan.",compareModel:"Bandingkan dengan contoh:",ownNot:"Jangan sebut “{w}” di sini — itulah yang pelajaran ini betulkan. Cuba lagi.",ownShort:"Jawab dengan ayat Inggeris yang lengkap, bukan satu perkataan sahaja.",missionOff:"Cakap tentang tugasan di atas — guna perkara dalam tugasan itu.",stransSubL2:"Baca situasi, tekan mikrofon dan sebut dalam Bahasa Inggeris — boleh guna ayat anda sendiri.",ownMust:"Sebut juga bahagian ini: {w}… Cuba lagi.",slipTip:"Tip: {t}",planStory:"Fikir 15 saat: apa berlaku dahulu? Kemudian? Kesudahannya?",planPPF:"Fikir 15 saat: apa perkara utama? Kenapa? Apa langkah seterusnya?",planLoop:"Fikir 15 saat: jawapan anda? Butiran apa? Soalan balas apa?",ownAskAux:"Soalan anda kurang satu perkataan: contohnya Where DO you…? / How ARE you…? Cuba lagi.",ownAskTopic:"Betul, itu soalan — tapi tanya perkara yang diminta dalam tugasan. Cuba lagi.",dlgSay:"Ayat ini disebut: tekan mikrofon dan cakap.",
  wholeK:"Cakap semuanya sekali gus",missionK:"Misi Boss: cakap beberapa ayat",missionSub:"Tekan mikrofon dan cakap semuanya; tekan sekali lagi bila selesai.",missionModel:"Lihat contoh",missionHide:"Tutup contoh",missionRetry:"Cakap dengan lebih lengkap — sebut setiap perkara yang diminta.",missionNeed:"Sekurang-kurangnya {n} perkataan Inggeris",missionGaps:"Masih kurang: {g}.",missionShort:"Anda sebut {n} perkataan Inggeris; perlu sekurang-kurangnya {m}.",
  whyFact:"Perhatian: di sini sebut {w}. Cuba lagi.",whySmall:"Kurang satu perkataan kecil: {w}. Dalam ayat Inggeris perkataan ini tidak boleh ditinggalkan. Cuba lagi.",whyForm:"Perhatikan hujung perkataan: sebut {w}. Cuba lagi.",whyMissing:"Perkataan merah tertinggal atau kurang jelas. Cuba lagi.",
  skippedN:"Anda melangkau {n} latihan bercakap/mendengar dalam pelajaran ini — cuba lagi bila sesuai.",missionGood:"Misi selesai! Lengkap sekali.",missionS1:"Baca tugasan di atas dan fikir setiap perkara yang perlu disebut",
  resumeQ:"Kali lepas anda berhenti di langkah {n} pelajaran ini. Sambung?",resumeYes:"Sambung",resumeNo:"Mula semula",
  roleNote:"Dialog latihan: umur dan tempat dalam ayat ikut soalan sahaja, bukan semestinya tentang anda.",gistEase:"Tak faham pun tak apa — teka dahulu. Perkataan ini akan diajar sekejap lagi."},
 en:{gistK:"Listen to the conversation first",gistSub:"No text — just listen, then answer the question below.",gistPlay:"▶ Play the conversation",gistStop:"■ Stop",
  loK:"Listen only",loSub:"Listen to this sentence (no text), then answer.",loWas:"The sentence was:",
  stransK:"Say it in English",stransSub:"Read this, tap the mic and say it in English.",stransAns:"You can say:",stransRetry:"Not quite. Think, then say it again.",ownAskRetry:"Almost — ask {who} a question.",compareModel:"Compare with the model:",ownNot:"Don't say “{w}” here — that is exactly what this lesson corrects. Try again.",ownShort:"Answer with a full English sentence, not just one word.",missionOff:"Talk about the task above — use the things in the task.",stransSubL2:"Read the situation, tap the mic and say it in English — your own words are fine.",ownMust:"Say this part too: {w}… Try again.",slipTip:"Tip: {t}",planStory:"Take 15 seconds: what happened first? Then? How did it end?",planPPF:"Take 15 seconds: what is the point? Why? What is the next step?",planLoop:"Take 15 seconds: your answer? One detail? A question back?",ownAskAux:"Your question is missing a word: e.g. Where DO you…? / How ARE you…? Ask again.",ownAskTopic:"That is a question — but ask about what the task says. Try again.",dlgSay:"Say this line: tap the mic and speak.",
  wholeK:"Say it all in one go",missionK:"Boss mission: say a few sentences",missionSub:"Tap the mic and say it all; tap again when you finish.",missionModel:"See an example",missionHide:"Hide the example",missionRetry:"Say a bit more — cover everything the task asks for.",missionNeed:"At least {n} English words",missionGaps:"Still missing: {g}.",missionShort:"You said {n} English words; at least {m} are needed.",
  whyFact:"Check: it should be {w} here. Try again.",whySmall:"A small word is missing: {w}. English sentences need it — say it again.",whyForm:"Check the ending: say {w} here. Try again.",whyMissing:"The red words were missing or unclear. Say it again.",
  skippedN:"You skipped {n} speaking/listening steps in this lesson — try them when you can.",missionGood:"Mission complete! Very full answer.",missionS1:"Read the task above and plan each thing you need to say",
  resumeQ:"Last time you stopped at step {n} of this lesson. Carry on?",resumeYes:"Carry on",resumeNo:"Start again",
  roleNote:"Practice dialogue: the ages and places are part of the exercise, not necessarily about you.",gistEase:"It's fine not to understand yet — have a guess. You'll learn these words next."}
};
Object.keys(UI_L1).forEach(k=>Object.assign(UI[k], UI_L1[k]));
/* Level 2 screens (2026-09-25) */
const UI_L2 = {
 zh:{convoK:"先听，再回应",convoSub:"点 🔊 听对方说什么，再点最合适的回应，把它们配对。",lsK:"听一听，选答案",lsSub:"听这一句（先不看字），然后回答。",lsShow:"看文字",
  planK:"先想一想",planSub:"开口前先想 15 秒：你要说哪几件事？先说什么，再说什么？",planGo:"我准备好了",planWait:"再想 {n} 秒…",
  cueZh:"看中文",skillUse:"这一课用的公式",sorderSub:"把句子排成最清楚的顺序。",unitLocked:"先通过上一个单元的 Boss（答对 {pass}%），这个单元就会打开。"},
 ms:{convoK:"Dengar, kemudian balas",convoSub:"Tekan 🔊 untuk dengar, kemudian pilih balasan yang paling sesuai.",lsK:"Dengar dan pilih",lsSub:"Dengar ayat ini (tanpa teks dahulu), kemudian jawab.",lsShow:"Lihat teks",
  planK:"Fikir dahulu",planSub:"Fikir 15 saat sebelum bercakap: apa perkara yang nak disebut? Mana dahulu?",planGo:"Saya sudah sedia",planWait:"{n} saat lagi…",
  cueZh:"Lihat terjemahan",skillUse:"Formula pelajaran ini",sorderSub:"Susun ayat dalam urutan yang paling jelas.",unitLocked:"Lulus Boss unit sebelum ini ({pass}% betul) untuk membuka unit ini."},
 en:{convoK:"Listen, then reply",convoSub:"Tap 🔊 to hear each line, then tap the best reply to match it.",lsK:"Listen and choose",lsSub:"Listen to this (no text yet), then answer.",lsShow:"Show the text",
  planK:"Think first",planSub:"Take 15 seconds before you speak: which points will you make, and in what order?",planGo:"I'm ready",planWait:"{n} more seconds…",
  cueZh:"Show my language",skillUse:"This lesson's formula",sorderSub:"Put the sentences in the clearest order.",unitLocked:"Pass the Boss of the unit before (at least {pass}% correct) to open this unit."}
};
Object.keys(UI_L2).forEach(k=>Object.assign(UI[k], UI_L2[k]));
/* The words around the exercises in the learner's own language (walkthrough 2026-09-25:
   a zh beginner met "Fill in the Blank", "Check", "Lesson Complete!", "Accuracy"… in
   English on every screen). The English being learned stays English; only the frame
   moves. `en` keeps the originals above. */
const UI_LOCAL = {
 zh:{continue:"继续",check:"检查",start:"开始",resume:"继续",startLesson:"开始这一课",correct:"答对了！",wrong:"不太对",answerIs:"正确答案：",
  vocab:"单词",patterns:"句型",fill:"填空",sub:"换词造句",order:"排句子",trans:"翻译",mcq:"选择题",dialog:"对话",boss:"Boss 挑战",
  lessonDone:"这一课完成了！",bossDone:"打败 Boss 了！",resSub:"下一课已经打开。",accuracy:"正确率",locked:"未开放",done:"已完成",go:"进行中",new:"开始",
  lesson:"第",lessonU:"课",module:"单元",bonus:"完成奖励",bossBonus:"Boss 奖励",heroNew:"从这里开始学英文。",heroCont:"从上次停下的地方继续。",
  allDone:"恭喜！你完成了整个 Pre-Beginner！🎉",step:"步骤",sceneLbl:"场景",you:"你",changeLang:"要换解释语言吗？",menuTitle:"选单",cancel:"关闭",
  saveLocal:"保存到这台手机",quitYes:"退出",quitNo:"继续学习",soundOn:"🔊 声音已打开",soundOff:"🔇 声音已关闭",
  reviewLbl:"今天的复习",reviewN:"有 {n} 题要复习",reviewNow:"开始复习",allCaught:"都复习完了 🎉",noReview:"现在没有要复习的题目。",reviewDone:"复习完成！",
  clearedMsg:"{c} 题过关 · 还有 {r} 题要复习。",reviewAgain:"继续复习",mistakes:"要复习的错题",praise:["答对了！","太棒了！","做得好！","完美！","继续加油！"],
  combo:"连对",nextUp:"下一课",backHome:"回首页",dailyGoal:"每日目标",goalDone:"🎉 今天的目标达成了！",courseProg:"课程进度",streakMile:"🔥 连续 {n} 天！太厉害了！",
  navHome:"地图",navProfile:"我的",achTitle:"成就",statLessons:"课",statStreak:"连续天数",student:"Touch 学员",editName:"改名字",saveName:"保存",
  cpSub:"Pre-Beginner 课程",startFlag:"从这里开始",toNext:"再 {n} XP 升到 Lv {lv}",listen:"听音配对",meaningIs:"意思：",
  nlTag:"下一级",nlLocked:"未开放 · {n}/25 课",nlSoon:"即将推出 🎉",obTitle:"欢迎！👋",obSkip:"跳过",
  speakTitle:"开口说",record:"录音",stopBtn:"停止",play:"播放",tryAgain:"再录一次",speakSay:"说这一句：",recState:"录音中……",getReady:"准备……",speakNow:"现在说！",saving:"保存中……",
  offTitle:"建议的学习路线",offGo:"继续",offBack:"返回",
  speakDenied:"无法使用麦克风（可能未授权）。没关系，点「继续」往下，不影响过关。",speakSaved:"✓ 已录好，保存在本机。点「播放」听听自己的发音！",
  speakSavedHint:"找到你上次的录音了，点「播放」可以回听，或再录一次。",speakWaitHint:"按「录音」后先别说话——看到「现在说！」再开始说，录音会更完整。",
  obSub:"我们要怎么称呼你？你的名字会出现在练习里（例如 My name is …），之后也可以在「我的」里修改。"},
 ms:{continue:"Teruskan",check:"Semak",start:"Mula",resume:"Sambung",startLesson:"Mula pelajaran",correct:"Betul!",wrong:"Belum tepat",answerIs:"Jawapan betul:",
  vocab:"Perkataan",patterns:"Pola ayat",fill:"Isi tempat kosong",sub:"Tukar perkataan",order:"Susun ayat",trans:"Terjemah",mcq:"Pilih jawapan",dialog:"Dialog",boss:"Cabaran Boss",
  lessonDone:"Pelajaran selesai!",bossDone:"Boss dikalahkan!",resSub:"Pelajaran seterusnya sudah dibuka.",accuracy:"Ketepatan",locked:"Berkunci",done:"Selesai",go:"Sedang belajar",new:"Mula",
  lesson:"Pelajaran",module:"Unit",bonus:"Bonus selesai",bossBonus:"Bonus Boss",heroNew:"Mula belajar Bahasa Inggeris di sini.",heroCont:"Sambung dari tempat anda berhenti.",
  allDone:"Tahniah! Anda sudah tamat Pre-Beginner! 🎉",step:"Langkah",sceneLbl:"Situasi",you:"Anda",changeLang:"Tukar bahasa penerangan?",menuTitle:"Menu",cancel:"Tutup",
  saveLocal:"Simpan dalam telefon ini",quitYes:"Keluar",quitNo:"Terus belajar",soundOn:"🔊 Bunyi dihidupkan",soundOff:"🔇 Bunyi dimatikan",
  reviewLbl:"Ulang kaji hari ini",reviewN:"{n} soalan untuk diulang kaji",reviewNow:"Ulang kaji",allCaught:"Semua sudah diulang kaji 🎉",noReview:"Tiada ulang kaji buat masa ini.",reviewDone:"Ulang kaji selesai!",
  clearedMsg:"{c} lulus · {r} lagi untuk diulang kaji.",reviewAgain:"Teruskan ulang kaji",mistakes:"Kesilapan untuk diulang kaji",praise:["Betul!","Hebat!","Bagus!","Sempurna!","Teruskan!"],
  combo:"Berturut",nextUp:"Seterusnya",backHome:"Laman utama",dailyGoal:"Sasaran harian",goalDone:"🎉 Sasaran hari ini tercapai!",courseProg:"Kemajuan kursus",streakMile:"🔥 {n} hari berturut-turut! Hebat!",
  navHome:"Peta",navProfile:"Saya",achTitle:"Pencapaian",statLessons:"Pelajaran",statStreak:"Hari berturut-turut",student:"Pelajar Touch",editName:"Tukar nama",saveName:"Simpan",
  cpSub:"Kursus Pre-Beginner",startFlag:"MULA DI SINI",toNext:"{n} XP lagi ke Lv {lv}",listen:"Padankan bunyi",meaningIs:"Maksud:",
  nlTag:"Tahap seterusnya",nlLocked:"Berkunci · {n}/25 pelajaran",nlSoon:"Akan datang 🎉",obTitle:"Selamat datang! 👋",obSkip:"Langkau",
  speakTitle:"Bercakap",record:"Rakam",stopBtn:"Berhenti",play:"Main",tryAgain:"Rakam semula",speakSay:"Sebut ayat ini:",recState:"Merakam…",getReady:"Bersedia…",speakNow:"Cakap sekarang!",saving:"Menyimpan…",
  offTitle:"Laluan belajar yang dicadangkan",offGo:"Teruskan",offBack:"Kembali",
  speakDenied:"Mikrofon tidak dapat digunakan (mungkin tiada kebenaran). Tidak mengapa, tekan Teruskan.",speakSaved:"✓ Rakaman disimpan dalam telefon ini. Tekan Main untuk dengar sebutan anda!",
  speakSavedHint:"Rakaman lepas anda dijumpai. Tekan Main untuk dengar, atau rakam semula.",speakWaitHint:"Selepas tekan Rakam, tunggu dahulu — mula bercakap apabila “Cakap sekarang!” muncul.",
  obSub:"Apa nama anda? Nama anda akan muncul dalam latihan (cth. My name is …). Anda boleh menukarnya di Saya bila-bila masa."}
};
Object.keys(UI_LOCAL).forEach(k=>Object.assign(UI[k], UI_LOCAL[k]));
// the course's own words (its name, the next level) last, over everything above
Object.keys(CONF.ui || {}).forEach(k=>Object.assign(UI[k], CONF.ui[k]));

const MASCOT_SVG = '<svg viewBox="0 0 78 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
 +'<ellipse cx="39" cy="90" rx="22" ry="5" fill="rgba(27,36,51,.10)"/>'
 +'<rect x="20" y="46" width="38" height="40" rx="14" fill="#15357B"/>'
 +'<rect x="20" y="46" width="38" height="12" rx="6" fill="#D9B56B"/>'
 +'<circle cx="39" cy="26" r="20" fill="#F6CFA6"/>'
 +'<path d="M19 24a20 20 0 0 1 40 0v-3c0-8-7-16-20-16S19 13 19 21v3Z" fill="#0D2253"/>'
 +'<rect x="14" y="18" width="10" height="20" rx="5" fill="#0D2253"/>'
 +'<rect x="54" y="18" width="10" height="20" rx="5" fill="#0D2253"/>'
 +'<circle cx="32" cy="28" r="2.6" fill="#16202E"/><circle cx="46" cy="28" r="2.6" fill="#16202E"/>'
 +'<path d="M34 36q5 4 10 0" stroke="#16202E" stroke-width="2" stroke-linecap="round" fill="none"/>'
 +'</svg>';
/* Growth Tree art migrated from Level 1 (5 module stages: seed→confidence tree) */
const CHARACTERS = {
  amy: { name:"Amy", role:"coach", img:"../../shared/assets/characters/amy-coach-point-left.png" },
};
function charImg(id){ return (CHARACTERS[id] && CHARACTERS[id].img) || ""; }
function mascotBubble(html){
 // Level 1 design: image-based coach with graceful fallback to the inline mascot if the asset is missing.
 return `<div class="qrow"><span class="mascot"><span class="coach-wrap"><img
  class="coach"
  src="${charImg('amy')}"
  alt="TOUCH English Learning Coach"
  loading="lazy"
  decoding="async"
  data-char="amy"
  onerror="this.classList.add('char-missing');this.style.visibility='hidden';"
/></span></span><div class="bubble"><div class="bt">${html}</div></div></div>`;
}
const AVATAR_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:42px;height:42px"><circle cx="12" cy="8.4" r="3.7" fill="currentColor"/><path d="M4.6 20c1.2-3.4 4.1-5.1 7.4-5.1s6.2 1.7 7.4 5.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const SPK_ON_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 9.5v5a1 1 0 0 0 1 1h2.6l4.2 3.4a.8.8 0 0 0 1.3-.62V5.72a.8.8 0 0 0-1.3-.62L7.6 8.5H5a1 1 0 0 0-1 1Z" fill="currentColor"/><path d="M16 9c.9.7 1.5 1.8 1.5 3s-.6 2.3-1.5 3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M18.2 6.6A7.2 7.2 0 0 1 20.5 12a7.2 7.2 0 0 1-2.3 5.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
const SPK_OFF_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 9.5v5a1 1 0 0 0 1 1h2.6l4.2 3.4a.8.8 0 0 0 1.3-.62V5.72a.8.8 0 0 0-1.3-.62L7.6 8.5H5a1 1 0 0 0-1 1Z" fill="currentColor"/><path d="M16 9.8l4.4 4.4M20.4 9.8L16 14.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
const SPK_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 9.5v5a1 1 0 0 0 1 1h2.6l4.2 3.4a.8.8 0 0 0 1.3-.62V5.72a.8.8 0 0 0-1.3-.62L7.6 8.5H5a1 1 0 0 0-1 1Z" fill="currentColor"/><path d="M16 9c.9.7 1.5 1.8 1.5 3s-.6 2.3-1.5 3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M18.2 6.6A7.2 7.2 0 0 1 20.5 12a7.2 7.2 0 0 1-2.3 5.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';

/* ---------- built-in pronunciation (Web Speech API, no internet / no files) ----------
   Rules: only single words & short phrases (≤3 words) are spoken; sentences are never read. */
const TTS = (typeof window!=="undefined" && "speechSynthesis" in window) || !!globalThis.TouchVoice;  /* 有 mp3 也算能念 */
let VOICE = null;
function pickVoice(){
 if(!TTS) return;
 const vs = speechSynthesis.getVoices();
 VOICE = vs.find(v=>/^en[-_]?(US|GB)/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang)) || null;
}
if(TTS){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

/* Who speaks in which voice. Marco 2026-09-25: each of the six characters has their own
   voice, the same one as in the classroom materials (touch-lesson-materials
   lessons/audio/voices.json); the learner and model sentences are Bella. Unnamed people
   are "xm" / "xf" (Chris / Matilda — no character's voice). A recording of a character's
   line is "<code>-<key>.mp3". tools/build-audio.mjs reads this same line, so it stays one
   JSON object on one line. */
const WHO_NAME = {tan:"Mr. Tan", kumar:"Kumar", ali:"Ali", siti:"Siti", meiling:"Mei Ling", amy:"Amy"};
const VOICE_OF = {"Mr. Tan":"tan","Kumar":"kumar","Ali":"ali","Siti":"siti","Mei Ling":"meiling","Amy":"amy","tan":"tan","kumar":"kumar","ali":"ali","siti":"siti","meiling":"meiling","amy":"amy","New colleague":"xm","Trainee":"xf","Receptionist":"xf","Friend":"xf","Customer":"xm","Landlord":"xm"};
/* Pre-Beginner has a recording of every option and every built sentence. Level 1 and 2 record
   only what a learner must or should hear (Marco 2026-09-25, A+B): there an option is not read
   when tapped, the right one is read once answered, and a substitution sentence has no speaker. */
const ALL_AUDIO = ()=> typeof CONF==="undefined" || CONF.flow==="pb";
function voiceOf(who){ return (who && who!=="Y" && VOICE_OF[who]) || "xm"; }
/* heard lines with no speaker of their own (listen, ls, cm): the lesson's dialogue partner */
function lessonVoice(l){ const x = ((l && l.d && l.d.lines) || []).find(y=>y.who && y.who!=="Y"); return voiceOf(x && x.who); }
/* a sentence's ♪ stops breathing once it has been heard (lesson-frame.css .heard) */
document.addEventListener("click", e=>{ const el = e.target.closest && e.target.closest("[data-say],[data-sayit]"); if(el) el.classList.add("heard"); }, true);
function speak(txt, btn, slow, mustHear, voice){
 if(!S.sound) return;
 if(NOSPEAK.has(String(txt).trim())) return;
 if(/_{2,}/.test(txt)) txt = blankPause(txt);        // a pattern card ("Thank you for ___")
 /* 有真人音档就播它（例句、整句对话都有）；没有才退回浏览器的机械音，
    而机械音维持原本的规矩：只念 3 个字以内的短词。
    mustHear: a line the learner has to hear to answer (the other person's question in
    自己说说看) falls back to the phone's voice at any length — silence there is worse. */
 if(globalThis.TouchVoice){ TouchVoice.say(txt, {btn:btn, slow:!!slow, voice:voice, fallbackMaxWords: (mustHear || (typeof CONF!=="undefined" && CONF.flow!=="pb")) ? 40 : 3}); return; }
 if(!TTS) return;
 let s = String(txt).replace(/[.,!?'"]/g," ").replace(/\s+/g," ").trim();
 if(!s || s.split(" ").length>3) return;            // words only — never sentences
 s = s.toLowerCase();                               // avoids "capital I" being spoken for lone capitals
 // expand abbreviations so they aren't spelled out letter-by-letter
 s = s.replace(/\bmr\b/g,"mister").replace(/\bmrs\b/g,"missus").replace(/\bms\b/g,"miz").replace(/\bdr\b/g,"doctor");
 if(/[\u3400-\u9FFF\uF900-\uFAFF\u3040-\u30FF\uAC00-\uD7AF]/.test(s)) return; // skip CJK names
 try{
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(s);
  if(VOICE) u.voice = VOICE;
  u.lang = (VOICE && VOICE.lang) || "en-US";
  u.rate = 0.8;                                      // slow & clear for beginners
  if(btn){ btn.classList.add("playing"); u.onend = u.onerror = ()=>btn.classList.remove("playing"); }
  speechSynthesis.speak(u);
 }catch(e){}
}

/* ---------- Speak Up: local-only voice recording ---------- */
const PREVIEW = !!(window.TOUCH_PLATFORM && window.TOUCH_PLATFORM.preview);   // Student View, see the Skip hook below
const CANREC = !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.indexedDB);
let REC = {recorder:null, stream:null, audio:null, timers:[]};
function recTimer(fn, ms){ const id = setTimeout(fn, ms); REC.timers.push(id); return id; }
function killRec(){
 REC.timers.forEach(clearTimeout);
 try{ if(REC.recorder && REC.recorder.state==="recording") REC.recorder.stop(); }catch(e){}
 try{ if(REC.stream) REC.stream.getTracks().forEach(tr=>tr.stop()); }catch(e){}
 try{ if(REC.audio){ REC.audio.pause(); } }catch(e){}
 REC = {recorder:null, stream:null, audio:null, timers:[]};
 try{ if(window.TouchSpeech) TouchSpeech.stop(); }catch(e){}     // a recognition still listening on the last screen
}
const CD_TICK = 650;     // countdown pace (ms per number)
const HEAD_BUF = 400;    // recorder warm-up before "Speak now" (protects the first syllable)
const TAIL_BUF = 450;    // keep recording after Stop (protects the last syllable)
function recDB(){
 return new Promise((res,rej)=>{
  const r = indexedDB.open(CONF.idb, 1);
  r.onupgradeneeded = ()=>{ r.result.createObjectStore("recs"); };
  r.onsuccess = ()=>res(r.result);
  r.onerror = ()=>rej(r.error);
 });
}
async function recSave(key, blob){
 try{
  const db = await recDB();
  await new Promise((res,rej)=>{
   const tx = db.transaction("recs","readwrite");
   tx.objectStore("recs").put(blob, key);
   tx.oncomplete = res; tx.onerror = ()=>rej(tx.error);
  });
  return true;
 }catch(e){ return false; }
}
async function recLoad(key){
 try{
  const db = await recDB();
  return await new Promise((res,rej)=>{
   const q = db.transaction("recs").objectStore("recs").get(key);
   q.onsuccess = ()=>res(q.result||null); q.onerror = ()=>rej(q.error);
  });
 }catch(e){ return null; }
}
/* Playing the learner's own recording. On iPhone the sound came out of the earpiece after
   the microphone had been used (「没有办法播放听回自己的声音」): say it is playback first.
   A refused play is reported through onErr instead of vanishing. */
function playBlob(blob, onErr){
 // iPhone: through Web Audio (shared/voice.js), so playing it back does not take the microphone away from the next 跟着说
 if(window.TouchVoice && TouchVoice.playBlob){ TouchVoice.playBlob(blob, onErr); return; }
 try{
  const url = URL.createObjectURL(blob);
  REC.audio = new Audio(url);
  REC.audio.setAttribute("playsinline", "");
  REC.audio.onended = ()=>{ try{ URL.revokeObjectURL(url); }catch(e){} };
  REC.audio.onerror = ()=>{ if(onErr) onErr("media-error "+((REC.audio.error && REC.audio.error.code) || "")+" "+(blob.type||"")); };
  const p = REC.audio.play();
  if(p && p.catch) p.catch(e=>{ if(onErr) onErr((e && e.name) || "play-failed"); });
 }catch(e){ if(onErr) onErr((e && e.message) || "error"); }
}

/* ---------- safe storage ----------
   共用存档层，见 ../../shared/storage.js（同一份模组给全部课程用）。
   值直接存原生 JSON，不用自己 stringify / parse。 */
const store = TouchStore.open(CONF.id);

/* ---------- state ---------- */
/* 启动页选过的「解释语言 ＋ 名字」（shared/profile.js）。
   这个课程自己存过的优先 —— 学生仍然可以只在某一个课程换语言；
   没存过就跟启动页走，不用每进一个课程重选一次、重填一次名字。 */
const SP = globalThis.TouchProfile || null;

let S = {
 /* 在平台里（SP.platform）：名字、语言以平台为准，不用这个课程自己存的那份 */
 name: (SP && SP.platform) ? SP.get().name : (store.get("name", "") || (SP ? SP.get().name : "")),
 sound: store.get("sound", true),
 lang: (SP && SP.platform) ? (SP.lang() || store.get("lang", null)) : (store.get("lang", null) || (SP ? SP.lang() : null)),
 xp: store.get("xp", 0),
 done: store.get("done", {}),                      // {"m1-0":true,...} 过关（≥ PASS）的课
 practised: store.get("practised", {}),            // 做完但没到 PASS 的课：只是「已练习」，不算过关
 review: store.get("review", []),                  // [{m,l,k,n},...] wrong answers to redo
 day: store.get("day", {d:"", xp:0}),              // today's XP toward the daily goal
 streak: store.get("streak", {count:0, last:""})
};
function save(){
 store.patch({
  lang: S.lang || "",
  sound: !!S.sound,
  name: S.name || "",
  xp: S.xp,
  done: S.done,
  practised: S.practised,
  review: S.review,
  day: S.day,
  streak: S.streak
 });
}
function T(){ return UI[S.lang||"en"]; }
function tri(o){ return o ? (o[S.lang]||o.en||"") : ""; }
const PRACTICE_NAME = "Alex";                      // neutral fallback when no profile name set
function px(s){ voiceNames(); return String(s).split("{NAME}").join((S.name||PRACTICE_NAME).trim()); }
/* 句子里的学生名字不念，发音层在名字那里切开、空一拍（shared/voice.js「带学生名字的句子」）。
   每次代入名字时顺手同步 —— 名字在导览页、设定页都可能改，这样不会漏。 */
function voiceNames(){ if(globalThis.TouchVoice) TouchVoice.names = [(S.name||PRACTICE_NAME).trim()]; }
function todayStr(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function bumpStreak(){
 const t = todayStr();
 if(S.streak.last===t) return false;
 const y = new Date(); y.setDate(y.getDate()-1);
 const ys = y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");
 S.streak.count = (S.streak.last===ys) ? S.streak.count+1 : 1;
 S.streak.last = t;
 return STREAK_MILESTONES.includes(S.streak.count);   // true → celebrate
}

/* ---------- motivation: daily goal, confetti, streak milestones ---------- */
const DAILY_GOAL = 60;                                  // XP per day
const STREAK_MILESTONES = [3,7,14,30,60,100];
function addDayXP(n){
 const td = todayStr();
 if(S.day.d!==td) S.day = {d:td, xp:0};
 const before = S.day.xp;
 S.day.xp += n; save();
 if(before<DAILY_GOAL && S.day.xp>=DAILY_GOAL) setTimeout(()=>{ toast(T().goalDone); confetti(26); },700);
}
function dayXP(){ return S.day.d===todayStr() ? S.day.xp : 0; }
const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti(n){
 if(REDUCED) return;
 const cols=["#D9B56B","#15357B","#4FAE8A","#2A5BD7","#B08A3E","#8B1E3F"];
 for(let i=0;i<n;i++){
  const d=document.createElement("i");
  d.className="cf";
  d.style.left=(Math.random()*100)+"vw";
  d.style.background=cols[i%cols.length];
  d.style.animationDelay=(Math.random()*0.45)+"s";
  d.style.transform="rotate("+(Math.random()*360)+"deg)";
  document.body.appendChild(d);
  setTimeout(()=>d.remove(),2200);
 }
}

/* ---------- review pool ---------- */
function refKey(r){ return r.m+"-"+r.l+"-"+r.k+"-"+r.n; }
function poolAdd(r){ if(!S.review.some(x=>refKey(x)===refKey(r))) S.review.push(r); save(); }
function poolRemove(r){ S.review = S.review.filter(x=>refKey(x)!==refKey(r)); save(); }
function trackAnswer(ok, ref, qText, ansText, expl, given, question){
 if(!P) return;
 const st = (P.steps && P.steps[P.idx]) || {};
 // what the answer sheet's 太简单 / 太难 / 报错 report about (TouchReport)
 P.last = {ref, given: given==null ? "" : String(given), pooled:false, question: String(question || qText || "").slice(0,300)};
 /* REDO MISSED (2026-09-25): the second go at a missed question. Its first answer already
    put it in the review pool and in the mistakes list; getting it right now does NOT take
    it out of the pool — the spaced review later in the week is the point of the pool. */
 if(st.redo){ P.last.pooled = !ok; return; }
 if(ok){ poolRemove(ref); }
 else {
  poolAdd(ref);
  P.last.pooled = true;
  P.wrongs.push({q:qText, a:ansText, x:expl||""});
  // …and it comes back once more at the end of this lesson, tagged 再练一次
  if(P.mode==="lesson"){
   P.redoKeys = P.redoKeys || {};
   const k = refKey(ref);
   /* at most five: a learner who missed half the lesson should not face twelve more screens */
   if(!P.redoKeys[k] && Object.keys(P.redoKeys).length < 5){ const s = resolveRef(ref); if(s){ P.redoKeys[k] = 1; s.redo = true; P.steps.push(s); } }
  }
 }
}

/* ---------- pass mark ----------
   一课要答对 70% 才算过关（Marco 2026-09-24 选 A）。没到的只记「已练习」：
   可以重做，但不解锁 boss、不算进完成数／成就／「下一课已解锁」。
   已经存在 S.done 的课不动 —— 以前过关的照样算过关（规则只管今後的结果）。 */
const PASS = 0.7;
function lessonPractised(mi,li){ return !!S.practised[COURSE[mi].id+"-"+li]; }

/* ---------- unlock logic ---------- */
function lessonDone(mi,li){ return !!S.done[COURSE[mi].id+"-"+li]; }
function moduleDoneCount(mi){ let c=0; for(let i=0;i<COURSE[mi].lessons.length;i++) if(lessonDone(mi,i)) c++; return c; }
// Guided Freedom: modules & non-boss lessons are always open; only the Boss waits for module mastery.
/* CONF.gateUnits (Level 2, Marco 2026-09-25): a unit opens only when the Boss of the unit
   before it has been passed (70%). Everything else stays open inside an open unit. */
function moduleUnlocked(mi){
 if(!(typeof CONF!=="undefined" && CONF.gateUnits) || mi===0) return true;
 const prev = COURSE[mi-1], bi = prev.lessons.findIndex(x=>x.boss);
 return bi<0 || lessonDone(mi-1, bi);
}
function bossUnlocked(mi){
 const ls = COURSE[mi].lessons;
 for(let i=0;i<ls.length;i++){ if(!ls[i].boss && !lessonDone(mi,i)) return false; }
 return true;
}
function lessonUnlocked(mi,li){
 if(TESTMODE) return true;                                  // 测试模式：全部开放，boss 也能直接进
 if(!moduleUnlocked(mi)) return false;
 return COURSE[mi].lessons[li].boss ? bossUnlocked(mi) : true;
}
// the single best "next step" to recommend (first unfinished lesson the learner can take)
function recommendedLesson(){
 for(let mi=0;mi<COURSE.length;mi++)
  for(let li=0;li<COURSE[mi].lessons.length;li++)
   if(!lessonDone(mi,li) && lessonUnlocked(mi,li)) return {mi,li};
 return null;
}
function nextLesson(){ return recommendedLesson(); }

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function show(id){
 ["scr-lang","scr-name","scr-home","scr-play","scr-result","scr-profile"].forEach(s=>$(s).classList.add("hidden"));
 $(id).classList.remove("hidden");
 document.body.classList.toggle("in-lesson", id==="scr-play");   // the white lesson frame
 // bottom nav: visible on Home & Profile, hidden during lessons/results/language pick
 const nav=$("bottomnav");
 if(id==="scr-home"||id==="scr-profile"){
  nav.classList.remove("hidden");
  $("nav-home").classList.toggle("on", id==="scr-home");
  $("nav-profile").classList.toggle("on", id==="scr-profile");
 } else nav.classList.add("hidden");
 window.scrollTo(0,0);
}
function refreshChips(){ $("xpval").textContent=S.xp; $("stval").textContent=S.streak.count; }

/* ---------- modal & toast ---------- */
function closeOvl(){ const o=document.querySelector(".ovl"); if(o) o.remove(); }
function sheet(html){
 closeOvl();
 const o=document.createElement("div"); o.className="ovl";
 o.innerHTML = `<div class="sheet">${html}</div>`;
 o.addEventListener("click", e=>{ if(e.target===o) closeOvl(); });
 document.body.appendChild(o);
 return o;
}
function toast(msg){
 const t=document.createElement("div"); t.className="toast"; t.innerHTML=msg;
 document.body.appendChild(t);
 setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .25s"; setTimeout(()=>t.remove(),260); },1800);
}
/* safeNo: the "no" (stay) answer is the big one — for questions whose "yes" loses work
   (quitting a lesson: a learner who tapped ✕ by mistake lost it with one more tap). */
function askConfirm(msg, yesTxt, noTxt, onYes, safeNo){
 const o = sheet(`<h3>${esc(msg)}</h3><div class="sheetrow">
  <button class="btn ${safeNo?"btn-primary":"btn-ghost"}" id="mNo">${esc(noTxt)}</button>
  <button class="btn ${safeNo?"btn-ghost":"btn-primary"}" id="mYes">${esc(yesTxt)}</button></div>`);
 o.querySelector("#mNo").onclick = closeOvl;
 o.querySelector("#mYes").onclick = ()=>{ closeOvl(); onYes(); };
}
function openMenu(){
 const t = T();
 const names = {zh:"中文", ms:"Bahasa Melayu", en:"Simple English"};
 const o = sheet(`<h3>${esc(t.menuTitle)}</h3><div class="ssub">${esc(t.menuSub)}</div>
  ${["zh","ms","en"].map(k=>`<button class="langopt${S.lang===k?" cur":""}" data-l="${k}">
    <span class="flag">${k==="zh"?"中":(k==="ms"?"My":"En")}</span>
    <span><span class="nm">${names[k]}</span></span>
    ${S.lang===k?'<span style="margin-left:auto;color:var(--brand);font-weight:800">✓</span>':""}</button>`).join("")}
  <div class="sheetrow">
   <button class="btn btn-ghost" id="mClose">${esc(t.cancel)}</button>
   <button class="btn btn-primary" id="mSave">${esc(t.saveLocal)}</button>
  </div>`);
 o.querySelectorAll(".langopt").forEach(b=>{
  b.onclick = ()=>{
   const nl = b.dataset.l;
   closeOvl();
   if(nl!==S.lang){ S.lang=nl; if(SP) SP.setLang(nl); save(); if(P && P.steps && P.steps[P.idx]){ renderStep(); } else if(!P){ renderHome(); } toast("✓ "+names[nl]); }
  };
 });
 o.querySelector("#mClose").onclick = closeOvl;
 o.querySelector("#mSave").onclick = ()=>{
  save(); closeOvl();
  toast(store.persistent ? t.saved : t.savedMem);
 };
}

/* ---------- language screen ---------- */
document.querySelectorAll(".langopt").forEach(b=>{
 b.onclick = ()=>{ S.lang = b.dataset.lang; if(SP) SP.setLang(S.lang); save(); (S.name || (SP && SP.platform)) ? renderHome() : showNameScreen(); };
});
function showNameScreen(){
 const t = T();
 $("nametitle").textContent = t.obTitle;
 $("namesub").textContent = t.obSub;
 $("obname").value = S.name || "";
 $("obgo").textContent = t.start;
 $("obskip").textContent = t.obSkip;
 show("scr-name");
 setTimeout(()=>$("obname").focus(), 80);
}
$("obgo").onclick = ()=>{
 S.name = $("obname").value.trim();
 store.set("askedname", true);
 if(SP){ SP.set({name:S.name}); SP.markAsked(); }
 save();
 if(S.name) toast("👋 "+T().obHello.replace("{name}", S.name));
 renderHome();
};
$("obskip").onclick = ()=>{ S.name=""; store.set("askedname", true); if(SP) SP.markAsked(); save(); renderHome(); };
$("obname").addEventListener("keydown", e=>{ if(e.key==="Enter") $("obgo").click(); });
$("langswitch").addEventListener("click", openMenu);
/* Two switches, one setting: the page's top bar is hidden during a lesson, so the lesson
   header has its own (walkthrough 2026-09-25: a learner in a quiet office had no way to
   stop the autoplay, and 「在右上角打开声音」 pointed at nothing). */
function applySound(){
 document.body.classList.toggle("sound-off", !S.sound);
 try{ if(window.TouchVoice) TouchVoice.muted = !S.sound; }catch(e){}
 ["soundbtn","psound"].forEach(id=>{
  const b=$(id); if(!b) return;
  b.innerHTML = S.sound ? SPK_ON_SVG : SPK_OFF_SVG;
  b.classList.toggle("off", !S.sound);
  if(!TTS) b.style.display="none";
 });
}
function toggleSound(){
 S.sound = !S.sound; save(); applySound();
 if(!S.sound){ try{ if(window.TouchVoice) TouchVoice.stop(); }catch(e){} try{ if(TTS && window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} }
 toast(S.sound ? T().soundOn : T().soundOff);
}
/* The speaker opens a small panel (Marco 2026-09-26, 5B): the course's volume and the
   learner's own speed, two iPhone-style sliders. The number shows only while a slider is
   held; letting go plays a sample sentence at the new setting (like choosing a ringtone).
   The little speaker at the left turns the sound off and on, as the button used to. */
const TORT_SVG = '<span class="vemo" aria-hidden="true">🐢</span>';
const HARE_SVG = '<span class="vemo" aria-hidden="true">🐇</span>';
const VOL_LO_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L11.5 6v12l-4.3-3.5H4z" fill="currentColor"/></svg>';
const SAMPLE_SAY = "Nice to meet you. I'm happy to be here.";
function openVoicePanel(anchor){
 let pn = $("vpanel");
 if(pn){ pn.remove(); return; }
 if(!window.TouchVoice || !TouchVoice.user) return toggleSound();
 const u = TouchVoice.user();
 pn = document.createElement("div"); pn.id = "vpanel"; pn.className = "vpanel";
 const row = (id, min, max, val, left, right, fmtv, label)=>`<div class="ios-row">${left}<div class="ios-track"><input class="ios" id="${id}" type="range" min="${min}" max="${max}" step="0.05" value="${val}" aria-label="${label}" data-fmt="${fmtv}"><output class="ios-tip"></output></div>${right}</div>`;
 const L = ({zh:["音量","速度"], ms:["Kelantangan","Kelajuan"], en:["Volume","Speed"]})[S.lang] || ["Volume","Speed"];
 pn.innerHTML = row("vvol", 0, 1, S.sound ? u.volume : 0, `<button type="button" class="vmute${S.sound?"":" off"}" id="vmute" aria-label="sound on/off">${S.sound ? VOL_LO_SVG : SPK_OFF_SVG}</button>`, SPK_ON_SVG, "%", L[0])
  + row("vspd", 0.75, 1.25, u.speed, TORT_SVG, HARE_SVG, "x", L[1]);
 document.body.appendChild(pn);
 const r = anchor.getBoundingClientRect();
 pn.style.top = (r.bottom + 8) + "px";
 pn.style.right = Math.max(12, window.innerWidth - r.right - 8) + "px";
 pn.querySelectorAll("input.ios").forEach(sl=>{
  const tip = sl.parentNode.querySelector(".ios-tip");
  const put = ()=>{ const lo=+sl.min, hi=+sl.max, v=+sl.value, q=(v-lo)/(hi-lo); sl.style.setProperty("--p", (q*100)+"%");
   tip.textContent = sl.dataset.fmt==="%" ? (v<=0.02 ? ({zh:"静音",ms:"Senyap",en:"Mute"})[S.lang] : Math.round(v*100)+"%") : v.toFixed(2).replace(/0$/,"")+"×"; tip.style.left = `calc(${q*100}% + ${(0.5-q)*28}px)`; };
  put();
  const show = ()=>{ put(); tip.classList.add("show"); };
  sl.addEventListener("pointerdown", show); sl.addEventListener("touchstart", show, {passive:true}); sl.addEventListener("input", show);
  sl.addEventListener("change", ()=>{
   setTimeout(()=>tip.classList.remove("show"), 700);
   /* the volume slider all the way left is "sound off" — what anyone expects a volume to do;
      a web page cannot read or set the phone's own volume, so this is the course's sound only */
   if(sl.id==="vvol" && +sl.value<=0.02){ if(S.sound) toggleSound(); const m=$("vmute"); if(m){ m.classList.add("off"); m.innerHTML = SPK_OFF_SVG; } return; }
   TouchVoice.setUser(sl.id==="vvol" ? {volume:+sl.value} : {speed:+sl.value});
   if(!S.sound){ S.sound = true; save(); applySound(); const m=$("vmute"); if(m){ m.classList.remove("off"); m.innerHTML = VOL_LO_SVG; } }
   try{ TouchVoice.stop(); }catch(e){}
   TouchVoice.say(SAMPLE_SAY, {fallbackMaxWords:12});
  });
 });
 $("vmute").onclick = ()=>{ toggleSound(); const m=$("vmute"); m.classList.toggle("off", !S.sound); m.innerHTML = S.sound ? VOL_LO_SVG : SPK_OFF_SVG;
  const v = $("vvol"); if(v){ v.value = S.sound ? TouchVoice.user().volume : 0; v.dispatchEvent(new Event("input")); setTimeout(()=>{ const t2=v.parentNode.querySelector(".ios-tip"); if(t2) t2.classList.remove("show"); }, 700); } };
 setTimeout(()=>{
  const away = e=>{ if(!pn.isConnected){ document.removeEventListener("pointerdown", away, true); return; }
   if(!pn.contains(e.target) && e.target!==anchor && !anchor.contains(e.target)){ pn.remove(); document.removeEventListener("pointerdown", away, true); } };
  document.addEventListener("pointerdown", away, true);
 }, 0);
}
function explainChip(kind){
 const old = $("chipcard"); if(old){ old.remove(); if(old.dataset.kind===kind) return; }
 const n = P ? (kind==="combo" ? (P.combo||0) : (P.xp||0)) : 0;
 const X = ({zh:{
   combo:{h:`连续答对 ${n} 题`, b:["每连续答对一题，火就多一格。", "连续答对 3 题以上，每题多拿 +2 XP。", "答错一题，火就重新开始算。"]},
   xp:{h:`这一课拿到 ${n} XP`, b:["XP 是经验值：答对题目、开口说、完成一课都会加。", "XP 越多，首页的成长树就长得越大。", "答错不会扣分，放心练。"]}, ok:"知道了"},
  ms:{
   combo:{h:`${n} betul berturut-turut`, b:["Setiap jawapan betul berturut-turut menambah api.", "3 betul berturut-turut atau lebih: +2 XP untuk setiap jawapan.", "Satu jawapan salah, kiraan bermula semula."]},
   xp:{h:`${n} XP dalam pelajaran ini`, b:["XP ialah mata pengalaman: jawab betul, bercakap dan tamatkan pelajaran.", "Lebih banyak XP, lebih besar pokok di laman utama.", "Jawapan salah tidak menolak markah — berlatihlah."]}, ok:"Faham"},
  en:{
   combo:{h:`${n} right in a row`, b:["Every right answer in a row makes the fire bigger.", "3 or more in a row: +2 XP on each right answer.", "One wrong answer and the count starts again."]},
   xp:{h:`${n} XP in this lesson`, b:["XP is experience: right answers, speaking and finishing a lesson all add it.", "The more XP, the bigger your growth tree on the home page.", "A wrong answer takes nothing away — keep practising."]}, ok:"Got it"}})[S.lang];
 const c = X[kind];
 const card = document.createElement("div"); card.id = "chipcard"; card.className = "chipcard"; card.dataset.kind = kind;
 card.innerHTML = `<div class="cc-h"><span class="cc-ic">${kind==="combo" ? "🔥" : "⭐"}</span>${esc(c.h)}</div>`
  + (kind==="combo" ? `<div class="cc-dots">${[1,2,3,4,5].map(i=>`<span class="${i<=n?"on":""}${i===3?" mark":""}">${i<=n?"🔥":""}</span>`).join("")}</div>` : "")
  + `<ul>${c.b.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><button type="button" class="btn btn-primary btn-block cc-ok">${esc(X.ok)}</button>`;
 document.body.appendChild(card);
 card.querySelector(".cc-ok").onclick = ()=>card.remove();
 setTimeout(()=>{ const away = e=>{ if(!card.isConnected){ document.removeEventListener("pointerdown", away, true); return; }
  if(!card.contains(e.target) && !e.target.closest("#combochip,.pxp")){ card.remove(); document.removeEventListener("pointerdown", away, true); } };
  document.addEventListener("pointerdown", away, true); }, 0);
}
{ const cc = $("combochip"), px_ = document.querySelector(".pxp");
  if(cc){ cc.setAttribute("role","button"); cc.addEventListener("click", ()=>explainChip("combo")); }
  if(px_){ px_.setAttribute("role","button"); px_.addEventListener("click", ()=>explainChip("xp")); } }
$("soundbtn").addEventListener("click", e=>openVoicePanel(e.currentTarget));
$("psound").addEventListener("click", e=>openVoicePanel(e.currentTarget));   // no redraw: it would throw away a half-built answer
applySound();

/* ---------- home ----------
   首页由 ../../shared/course-home.js（TouchHome）画 —— 全部课程同一个首页（Marco 2026-09-24）：
   路线图在最上面，点圆币弹出卡片再按开始，每个单元有「指南」。
   这里只决定内容：哪一课是下一课、哪些开着、点了做什么（跟以前一样）。
   新的字只在首页用，放在 HOME_UI（三种语言都要有）。 */
const HOME_UI = {
 zh:{unit:"第 {u} 单元", lessonOf:"第 {u} 单元 · 第 {l} 课（共 {n} 课）", bossOf:"第 {u} 单元 · Boss 挑战",
  progress:"课程进度", goal:"每日目标", reviewN:"{n} 题要复习",
  start:"开始", again:"再练一次", guide:"指南", back:"返回", keyPhrases:"重点句", tips:"小提醒",
  bossLocked:"👑 Boss 是单元毕业战：本单元第 1–4 课每课都答对至少 {pass}% 就会解锁。"},
 ms:{unit:"Unit {u}", lessonOf:"Unit {u} · Pelajaran {l} daripada {n}", bossOf:"Unit {u} · Cabaran Boss",
  progress:"Kemajuan kursus", goal:"Matlamat harian", reviewN:"{n} soalan untuk diulang kaji",
  start:"MULA", again:"LATIH LAGI", guide:"Panduan", back:"Kembali", keyPhrases:"Ayat penting", tips:"Tip",
  bossLocked:"👑 Boss ialah ujian tamat unit: lulus Pelajaran 1–4 unit ini (sekurang-kurangnya {pass}% betul bagi setiap satu) untuk membukanya."},
 en:{unit:"Unit {u}", lessonOf:"Unit {u} · Lesson {l} of {n}", bossOf:"Unit {u} · Boss challenge",
  progress:"Course progress", goal:"Daily goal", reviewN:"{n} questions to review",
  start:"START", again:"PRACTISE AGAIN", guide:"Guide", back:"Back", keyPhrases:"Key sentences", tips:"Tips",
  bossLocked:"👑 The Boss is your unit graduation: pass Lessons 1–4 of this unit (at least {pass}% correct in each) to unlock it."}
};
function H(){ return HOME_UI[S.lang] || HOME_UI.en; }
function fmt(s, o){ return String(s).replace(/\{(\w+)\}/g, (m,k)=> o[k]!=null ? o[k] : m); }
/* 单元指南：只用课程里本来就有的内容。
   重点句 ＝ 每一课对话里「你」要说的前两句（Y 行的 ans，名字照练习里的方式代入），
   下面那行 ＝ 同一行的中文／马来文／英文说明（g）。
   小提醒 ＝ 每一课的第一个句型（p）和它的说明（n），加上 Boss 的那一个。 */
function unitGuide(m){
 const phrases = [], seen = {};
 m.lessons.forEach(l=>{
  if(l.boss) return;
  ((l.d && l.d.lines) || []).filter(x=>x.who==="Y" && x.ans).slice(0,2).forEach(x=>{
   const en = px(x.ans).replace(/\s+([.,!?;:])/g,"$1");
   if(seen[en]) return;
   seen[en] = 1;
   phrases.push({ en, tr: (x.g && !Array.isArray(x.g)) ? tri(x.g) : "", say: ()=>speak(en) });
  });
 });
 const tips = m.lessons.filter(l=>l.p && l.p[0] && l.p[0].n).map(l=>l.p[0].t+" — "+tri(l.p[0].n));
 return { phrases, tips };
}
function renderHome(){
 $("topbar").classList.remove("hidden");
 refreshChips();
 const t = T(), h = H();
 $("nav-home-lbl").textContent = t.navHome;
 $("nav-profile-lbl").textContent = t.navProfile;

 const totalLessons = COURSE.reduce((a,m)=>a+m.lessons.length,0);
 const doneLessons = Object.keys(S.done).length;
 const pct = Math.round(doneLessons/totalLessons*100);
 const gx = Math.min(dayXP(), DAILY_GOAL);
 const rn = S.review.length;
 const rec = recommendedLesson();
 /* 跟以前一样：过关的、建议的下一课 → 直接开始；其他开着的 → 先给建议路线（Guided Freedom） */
 const tap = (mi,li,state)=> state==="avail" ? offPathSuggest(mi,li) : startLesson(mi,li);

 // ---- next-level teaser, under the map (same card and toast as before) ----
 const ready = doneLessons >= totalLessons;
 const after = document.createElement("div");
 after.className = "nextlvl"+(ready?" ready":"");
 after.innerHTML = `<span class="nl-tag">${esc(t.nlTag)}</span>
  <h3><span class="lk">${ready?"🎉":"🔒"}</span>${esc(CONF.next)}</h3>
  <p>${esc(t.nlDesc)}</p>
  <button class="btn" id="nlbtn">${ready ? esc(t.nlSoon) : esc(t.nlLocked.replace("{n}", doneLessons))}</button>`;
 after.querySelector("#nlbtn").onclick = ()=>toast(ready ? T().nlToastSoon : T().nlToastLocked);

 const sections = COURSE.map((m,mi)=>{
  const n = m.lessons.length;
  return {
   kicker: fmt(h.unit, {u:mi+1})+" · "+moduleDoneCount(mi)+"/"+n,
   title: tri(m.title),
   guide: unitGuide(m),
   nodes: m.lessons.map((l,li)=>{
    const dn = lessonDone(mi,li), un = lessonUnlocked(mi,li);
    const isRec = rec && rec.mi===mi && rec.li===li;
    const state = dn ? "done" : (!un && !PREVIEW ? "locked" : (isRec ? "go" : "avail"));
    return {
     label: tri(l.t),
     sub: l.boss ? fmt(h.bossOf, {u:mi+1}) : fmt(h.lessonOf, {u:mi+1, l:li+1, n}),
     state, boss: !!l.boss, icon: l.boss ? "trophy" : "star",
     practised: !dn && lessonPractised(mi,li),
     lockedText: state==="locked" ? h.bossLocked.replace("{pass}", Math.round(PASS*100)) : "",
     onClick: state==="locked" ? null : ()=> PREVIEW ? startLesson(mi,li) : tap(mi,li,state)
    };
   })
  };
 });

 // a redraw while home is on screen (language switch) keeps the place; coming back from a lesson opens on the next coin
 const wasHome = !$("scr-home").classList.contains("hidden"), y = window.scrollY;
 const root = TouchHome.render($("homemap"), {
  level: CONF.level,
  progress: { label: h.progress, pct },
  streak: S.streak.count,
  goal: { pct: Math.round(gx/DAILY_GOAL*100), label: h.goal, value: gx+"/"+DAILY_GOAL+" XP", short: gx+"/"+DAILY_GOAL },
  review: rn>0 ? { title: fmt(h.reviewN, {n:rn}), count: rn, onClick: startReview } : undefined,
  labels: { start:h.start, again:h.again, guide:h.guide, back:h.back, keyPhrases:h.keyPhrases, tips:h.tips },
  sections,
  after
 });
 // unit bands stick under the top bar (standalone) or under the platform's course bar (top bar hidden there)
 const tb = $("topbar");
 root.style.setProperty("--th-sticky", ((tb && tb.offsetHeight) ? tb.offsetHeight + 4 : 62) + "px");
 show("scr-home");
 if(wasHome){ window.scrollTo(0, y); return; }
 requestAnimationFrame(()=>{
  const g = $("homemap").querySelector(".th-node.go");
  if(!g) return;
  const r = g.getBoundingClientRect(), vh = window.innerHeight || 700;
  if(r.top > vh*0.62) window.scrollTo({ top: window.scrollY + r.top - vh*0.42, behavior: "auto" });
 });
}

/* ---------- review session ---------- */
const KMAP = {fill:"f", mcq:"m", order:"o", trans:"tr", ls:"ls"};
function resolveRef(r){
 const lesson = COURSE[r.m] && COURSE[r.m].lessons[r.l];
 if(!lesson) return null;
 if(r.k==="dlg"){
  const ln = lesson.d.lines[r.n];
  if(!ln || ln.who!=="Y") return null;
  /* 复习时单独拿出一句对话，没有前後文。boss 的台词没有提示，以前每一句都只显示同一个场景，
     学生根本不知道这一题要回哪一句。所以题目 ＝ 对方上一句话 ＋ 这一句要做的事（c／g，没有才退回场景）。 */
  let prev = null;
  for(let i=r.n-1;i>=0;i--){ if(lesson.d.lines[i].who!=="Y"){ prev = lesson.d.lines[i]; break; } }
  const task = ln.c || ln.g || lesson.d.scene;
  const src = {};
  ["zh","ms","en"].forEach(k=>{ const tk = task[k]||task.en||""; src[k] = prev ? `${prev.who}: “${prev.en}” → ${tk}` : tk; });
  return {kind:"trans", it:{src, ans:ln.ans, x:ln.x||[], alt:ln.alt||[], xw:ln.xw||null, e:ln.c||ln.g||null}, n:r.n, ref:r};
 }
 const arr = lesson[KMAP[r.k]];
 if(!arr || !arr[r.n]) return null;
 return {kind:r.k, it:arr[r.n], n:r.n, ref:r};
}
function startReview(){
 const refs = S.review.slice(0,10);
 const steps = refs.map(resolveRef).filter(Boolean);
 if(!steps.length){ S.review=[]; save(); renderHome(); return; }
 P = {mi:0,li:0,steps,idx:0,xp:0,right:0,total:0,wrongs:[],combo:0,mode:"review"};
 $("combochip").classList.add("hidden");
 show("scr-play");
 renderStep();
}

/* ---------- lesson player ---------- */
/* ---------- Guided Freedom: gentle off-path suggestion ---------- */
function offPathSuggest(mi, li){
 const t = T();
 const rec = recommendedLesson();
 const lessons = COURSE[mi].lessons;
 const pathList = lessons.map((l,i)=>{
  const dn = lessonDone(mi,i);
  const isRec = rec && rec.mi===mi && rec.li===i;
  const mark = dn ? "✓" : (isRec ? "→" : (lessonPractised(mi,i) ? "↻" : "·"));
  const label = (l.boss ? "Boss" : (t.lesson+" "+(i+1)+(t.lessonU ? " "+t.lessonU : "")));
  return `<div class="oprow${isRec?" rec":""}${dn?" dn":""}"><span class="opm">${mark}</span>${esc(label)} · ${esc(tri(l.t))}</div>`;
 }).join("");
 const o = sheet(`<h3>${esc(t.offTitle)}</h3>
  <div class="ssub">${esc(t.offSub)}</div>
  <div class="oplist">${pathList}</div>
  <div class="offfree">${esc(t.offFree)}</div>
  <div class="sheetrow">
   <button class="btn btn-ghost" id="opBack">${esc(t.offBack)}</button>
   <button class="btn btn-primary" id="opGo">${esc(t.offGo)}</button>
  </div>`);
 o.querySelector("#opBack").onclick = closeOvl;
 o.querySelector("#opGo").onclick = ()=>{ closeOvl(); startLesson(mi,li); };
}

let P = null; // {mi,li,steps,idx,xp,right,total}
/* =============================================================================
   THE LESSON, REDESIGNED (Marco approved 2026-09-25; Duolingo's published lesson
   design + retrieval practice, spacing, interleaving, generation effect, pushed output).
   Pre-Beginner is the Copy level. About 15–18 screens, 5–7 minutes:

     goal      what you will be able to say, Amy waving              (LESSON_EXTRA.goal)
     meet ×k   new words in blocks of 2–3, each word big with 🔊
     hearpick  right after each block: hear one of its words, tap it (retrieval at once)
     repeat ×2 a target sentence: hear it, say it; the recogniser marks missed words
     review ≤2 from lessons already passed — S.review first (spacing), else fill/mcq
     fill · order · mcq · subst · trans   ONE of each, interleaved, not blocked
     dialog    the lesson's conversation (unchanged)
     own       SAY IT YOURSELF: a character asks, the learner answers    (LESSON_EXTRA.own)
     redo      every question missed above comes back once, tagged 再练一次

   The items not picked this time are not deleted: next time picks again at random,
   and they still reach the learner through the review pool and review-from-done.

   XP is what it was per kind: the old vocab +5 is the meet screens' (on the last one),
   the old listening match +5 the hearpicks' (on the last one), the old patterns +5 the
   first repeat's, the old Speak Up +5 SAY IT YOURSELF's (first try); every exercise
   keeps its own. The pass mark counts FIRST attempts only: redo screens and review
   items from earlier lessons score no point and cost none (a lesson is not failed on
   another lesson's question — an assumption, recorded here).
   Boss lessons keep their whole exercise set, interleaved, in the same frame.
============================================================================= */
/* the lesson's formula (OREO / PPF / Story Builder / Conversation Loop) as a small card */
function skillCardHTML(l){
 const K = (typeof CONF!=="undefined" && CONF.skills) || null;
 const sk = K && l && l.skill && K[l.skill];
 if(!sk) return "";
 const steps = (sk.steps||[]).map(x=>`<span class="skstep">${esc(x)}</span>`).join('<span class="skarr">→</span>');
 return `<div class="skillcard"><div class="skh">${esc(sk.icon||"")} ${esc(sk.name)} <span class="sktag">${esc(T().skillUse)}</span></div>${steps ? `<div class="sksteps">${steps}</div>` : ""}<div class="skline">${esc(tri(sk.line))}</div></div>`;
}
/* What went wrong in a spoken sentence, in the learner's language (walkthrough 2026-09-25:
   "I a little tired" was told 「红色的字没听清楚」 — blaming the voice for a missing word). */
function whyText(why, hidden){
 const t = T(), w0 = String(why||"").split(":").slice(1).join(":"), w = w0==="i" ? "I" : w0;
 const W = ({zh:{irr:"注意：这里要说 {w}（不规则变化，要记住）。再说一次。", swap:"意思不一样了：这里要说 {w}。再说一次。", not:"意思相反了：原句没有 not。再说一次。"},
  ms:{irr:"Perhatian: sebut {w} di sini (bentuk tak sekata, perlu diingat). Cuba lagi.", swap:"Maksudnya berubah: di sini sebut {w}. Cuba lagi.", not:"Maksudnya terbalik: ayat asal tiada not. Cuba lagi."},
  en:{irr:"Check: say {w} here (an irregular form to remember). Try again.", swap:"The meaning changed: say {w} here. Try again.", not:"The meaning is the opposite: the sentence has no not. Try again."}})[S.lang];
 // a slip that FAILS the answer is a correction, not a 「小提醒」 (Mei Ling / Ravi, round 3)
 if(/^slip:/.test(why)) return fmt(({zh:"这里要改：{t}", ms:"Betulkan: {t}", en:"Fix this: {t}"})[S.lang], {t: w0});
 if(/^not:/.test(why)) return w0;
 if(/^meaning:/.test(why)) return fmt(({zh:"意思不对：这里要说 {w}。再说一次。", ms:"Maksudnya salah: di sini sebut {w}. Cuba lagi.", en:"The meaning is off: say {w} here. Try again."})[S.lang], {w: w0});
 if(/^decoy:/.test(why)) return w0;
 if(why==="fact:not") return W.not;
 if(/^swap:/.test(why)) return fmt(W.swap, {w});
 if(/^form:/.test(why) && Object.values((window.TouchSpeech && TouchSpeech.irregular) || {}).includes(w)) return fmt(W.irr, {w});
 if(hidden && typeof CONF!=="undefined" && CONF.flow==="l2" && ideaCheck.slip && !/^(slip|decoy):/.test(why)) return notMsg(ideaCheck.slip);
 if(/^small:/.test(why)) return fmt(t.whySmall, {w});
 if(/^form:/.test(why)) return fmt(t.whyForm, {w});
 if(/^fact:/.test(why)) return fmt(t.whyFact, {w: w.charAt(0).toUpperCase()+w.slice(1)});
 return hidden ? t.stransRetry : t.whyMissing;
}
/* Common slips of Malaysian learners, spotted in free speech (a mission or SAY IT YOURSELF can
   pass on content and still deserve one correction — Mei Fong's "more lighter", "she clean"). */
/* walkthrough 2026-09-26: the tips "corrected" right English ("How long does it take?" →
   takes, "I have finished" → had, "more manpower", "I think… yesterday" → thought) and missed
   the real slips. A verb after does / did / can / to / let… is the base form; a comparative
   is a known one; and the beginner slips (I have 56 years old, I from, am agree…) are named. */
const S3 = v=>v==="go"?"goes":v==="do"?"does":v==="have"?"has":/(s|sh|ch|x|z|o)$/.test(v)?v+"es":/[^aeiou]y$/.test(v)?v.slice(0,-1)+"ies":v+"s";
const BASEOK = /\b(does|did|do|can|could|will|would|should|must|may|might|to|let|make|makes|made|help|helps|helped|lets|don't|doesn't|didn't|won't|can't|how long|how much|what time|where|when|why|what)\s+(\w+\s+){0,2}$/;
const COMPAR = "better|bigger|smaller|faster|cheaper|easier|harder|longer|shorter|nicer|cleaner|higher|lower|older|newer|closer|busier|happier|quicker|safer|stronger|warmer|colder|hotter|larger|earlier|later|slower|worse";
const SLIPS = [
 [new RegExp("\\bmore ("+COMPAR+")\\b"), m=>`more ${m[1]} → ${m[1]}`],
 [/\b(he|she|it|mr tan|siti|kumar|ali|mei ling|my (?:boss|manager|colleague|friend|sister|brother|mother|father|son|daughter)) (clean|buy|go|work|like|want|need|help|use|live|come|take|make|say|know|think|love|eat|drink|play|watch|start|finish|fix|check|have|do)\b(?! to\b)(?! (you|we|they|i)\b)/, (m, h)=> BASEOK.test(h.slice(0, m.index)) ? "" : `${m[1]} ${m[2]} → ${m[1]} ${S3(m[2])}`],
 [/\bi (good|busy|tired|happy|fine|okay|sad|sick|free|ready|sure|late|hungry|sleepy|worried|from|very)\b/, m=>`I ${m[1]} → ${m[1]==="from" ? "I am from / I come from" : "I am "+m[1]}`],
 [/\b(he|she|it) (very|so|a|an|from|good|busy|tired|happy|sick|late|friendly|helpful)\b/, (m, h)=> /\b(is|was|are|were|am|isn't|wasn't)\s+$/.test(h.slice(0, m.index)) ? "" : `${m[1]} ${m[2]} → ${m[1]} is ${m[2]}`],
 [/\bi have (\d+|\w+ty|\w+teen|ten|eleven|twelve)( \w+)? years? old\b/, m=>`I have … years old → I am ${m[1]} years old`],
 [/\bmy name (?!is\b)([a-z]+)\b/, m=> /^(are|am|was|were|be)$/.test(m[1]) ? `my name ${m[1]} → my name is` : `my name ${m[1]} → my name is ${m[1]}`],
 [/\b(am|is|are) (agree|have|like|want|need|go|come|work|live)\b/, m=> m[2]==="have" ? `${m[1]} have → ${m[1]} (without have)` : `${m[1]} ${m[2]} → ${m[2]}`],
 [/\bdid (you|i|he|she|we|they) (went|ate|bought|saw|came|took|met|had|did|made|got)\b/, (m, h)=> /\b(i|you|he|she|we|they|yes|no)\s+$/.test(h.slice(0, m.index)) ? "" : `did ${m[1]} ${m[2]} → did ${m[1]} + base form`],
 [/\bcan help (me|us)\b/, (m, h)=> /\b(you|i|we|they|he|she)\s+$/.test(h.slice(0, m.index)) ? "" : `can help ${m[1]} → can you help ${m[1]}`],
 [/\bi (likes|wants|needs|works|lives|goes|has|does|checks|takes)\b/, m=>`I ${m[1]} → I ${m[1].replace(/ies$/,"y").replace(/(ss|sh|ch|x|o)es$/,"$1").replace(/s$/,"").replace(/^ha$/,"have")}`],
 [/\byesterday i (go|eat|buy|see|take|come|meet|visit|watch|play|cook)\b/, m=>`yesterday I ${m[1]} → the past form`],
 [/\bvery like\b/, ()=>`very like → really like`],
 [/\bnice meet\b/, ()=>`nice meet → nice to meet`],
 [/\bbecause (is|was) (?!it\b)/, m=>`because ${m[1]} → because it ${m[1]}`],
 [/\b(go|goes|come|comes|travel|get|went|came)( to [a-z]+)? with (the )?(bus|car|train|taxi|grab|motorcycle|motorbike|lrt|mrt)\b/, m=>`with ${m[4]} → by ${m[4]}`],
 [/\bit (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+) o ?'?clock\b/, m=>`it ${m[1]} o'clock → it is ${m[1]} o'clock`],
 [/\b(two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|[2-9]|\d\d+) (minute|hour|day|week|month|year)\b(?!s)/, m=>`${m[1]} ${m[2]} → ${m[1]} ${m[2]}s`],
 [/\bi (\d+|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|\w+teen)( \w+)? years? old\b/, m=>`I ${m[1]} years old → I am ${m[1]} years old`],
 [/\bon (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+) o ?'?clock\b/, m=>`on ${m[1]} o'clock → at ${m[1]} o'clock`],
 [/\b(speak|know|understand) little\b/, m=>`${m[1]} little → ${m[1]} a little`],
 [/\bnow (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+) o ?'?clock\b/, m=>`now ${m[1]} o'clock → it is ${m[1]} o'clock now`],
 [/\b(start|starts|begin|finish|finishes) work (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/, m=>`${m[1]} work ${m[2]} → ${m[1]} work at ${m[2]}`],
 [/\b(start|starts|begin|finish|finishes|wake up|go home) on (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/, m=>`${m[1]} on ${m[2]} → ${m[1]} at ${m[2]}`],
 [/\bby the (bus|car|train|taxi|grab|motorcycle|motorbike|lrt|mrt)\b/, m=>`by the ${m[1]} → by ${m[1]}`],
 [/\bthe (\w+) (very|so|too) (\w+)\b/, (m, h)=> /^(is|was|are|were|not|also)$/.test(m[1]) ? "" : `the ${m[1]} ${m[2]} → the ${m[1]} is ${m[2]}`],
 [/\b(i|we|they|you) go work\b/, m=>`go work → go to work`],
 [/\btoday is on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/, m=>`today is on ${m[1]} → today is ${m[1]}`],
];
/* What to say instead of a lesson's `not` phrase — read off the phrase itself, so that
   「这里不能说「need doctor」」 also says "→ need a doctor" (Chen / Aisyah / Hafiz, round 3).
   A phrase with no rule here (a question to rephrase, "good night") keeps the plain message. */
const N_ = "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+";
const NOTFIX = [
 [/^i (\d+|\w+teen|twenty|thirty|forty|fifty|sixty|seventy|eighty)$/, m=>`I am ${m[1]} years old`],
 [/^years old (\S+)$/, m=>`I am ${m[1]} years old`],
 [new RegExp(`^o'clock (${N_})$`), m=>`${m[1]} o'clock`],
 [new RegExp(`^(?:in|on) (${N_}) o'clock$`), m=>`at ${m[1]} o'clock`],
 [new RegExp(`^wake up (${N_})$`), m=>`wake up at ${m[1]}`],
 [/^i (is|are)$/, ()=>`I am`],
 [/^a (operator|engineer|accountant|office)$/, m=>`an ${m[1]}`],
 [/^and little$/, ()=>`and a little`],
 [/^i can speaking$/, ()=>`I can speak`],
 [/^am speak$/, ()=>`I speak`],
 [/^i job$/, ()=>`my job`],
 [/^live at in$/, ()=>`live in`],
 [/^i live (\w+)$/, m=>`I live in ${m[1].replace(/^./, c=>c.toUpperCase())}`],
 [/^(?:i (?:no|not)|am not) (have|like|understand)$/, m=>`I don't ${m[1]}`],
 [/^(bank|it) (near|far)$/, m=>`${m[1]==="bank" ? "the bank" : "it"} is ${m[2]}`],
 [/^go to home$/, ()=>`go home`],
 [/^by (walk|foot)$/, ()=>`on foot`],
 [/^go (market|office)$/, m=>`go to the ${m[1]}`],
 [/^can i want$/, ()=>`can I have`],
 [/^(want a|need) doctor$/, ()=>`I need a doctor`],
 [/^i not (feeling|well)$/, m=>`I am not ${m[1]}`],
 [/^(she|he) working$/, m=>`${m[1]} is working`],
 [/^my (\w+) work$/, m=>`my ${m[1]} works`],
 [/^does (she|he) works$/, m=>`does ${m[1]} work`],
 [/^i can to$/, ()=>`I can + verb`],
 [/^at (johor bahru|jb|kulai|ipoh|penang|melaka|kuala lumpur|kl|skudai|singapore)$/, m=>`in ${m[1].replace(/\b(jb|kl)\b/, x=>x.toUpperCase()).replace(/\b[a-z]/g, c=>c.toUpperCase())}`],
 [/^for (count|check|calculate|write|print|send|call|make|do)$/, m=>`to ${m[1]}`],
 [/^(?:you )?(like|enjoy) go to$/, m=>`${m[1]} going to`],
 [/^i am (feel|drive|think)$/, m=>`I ${m[1]}`],
 [/^i goed$/, ()=>`I went`],
 [/^(there got|got one|got a clinic|have one clinic)$/, ()=>`there is a…`],
 [/^siti can help$/, ()=>`Siti, can you help`],
 [/^(said|talked) me$/, m=> m[1]==="said" ? `told me / said to me` : `talked to me`],
 [/^would rather to$/, ()=>`would rather + verb`],
 [/^more prefer$/, ()=>`prefer`],
 [/^i am not agree$/, ()=>`I don't agree`],
 [/^more (lighter|heavier)$/, m=>m[1]],
 [/^is broken since$/, ()=>`has been broken since`],
 [/^got problem$/, ()=>`there is a problem`],
 [/^is spoil$/, ()=>`is broken`],
 [/^was stop$/, ()=>`stopped`],
 [/^should to$/, ()=>`should + verb`],
 [/^let us (to|going)$/, m=> m[1]==="to" ? `let's + verb` : `let's go`],
 [/^i will calling$/, ()=>`I will call`],
 [/^can repeat$/, ()=>`can you repeat`],
 [/^lend from$/, ()=>`borrow from`],
 [/^borrow you$/, ()=>`lend you`],
 [/^(finish|finished|finish it|finish them|finish the list|ready|done) until$/, m=>`${m[1]} by`],
 [/^(return|refund) back$/, m=>m[1]],
 [/^(discuss|discussed) about$/, m=>m[1]],
 [/^wants? we$/, m=>m[0].replace(/we$/, "us")],
 [/^(colleagues|staff|customers) was$/, m=>`${m[1]} were`],
 [/^the app save me$/, ()=>`the app saves me`],
 [/^everyone get one$/, ()=>`everyone gets one`],
 [/^also can$/, ()=>`can also`],
 [/^thank you for listen$/, ()=>`thank you for listening`],
 [/^i will to$/, ()=>`I will + verb`],
];
function notFix(bad){ const k = spNorm(bad); for(const [re, fx] of NOTFIX){ const m = k.match(re); if(m) return fx(m); } return ""; }
const PASTCTX = /\b(yesterday|last (weekend|week|night|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|ago|in the end|was|were|went|had|did)\b/;
function pastOf(v){ const I = (window.TouchSpeech && TouchSpeech.irregular) || {}; return I[v] || (/e$/.test(v) ? v+"d" : /[^aeiou]y$/.test(v) ? v.slice(0,-1)+"ied" : v+"ed"); }
function slipTip(heard){
 /* sentence by sentence, when the words came with full stops ("Yes, I did. I had nasi lemak" is
    two sentences, not "did I had") */
 const parts = String((heard||[])[0]||"").split(/[.?!]+\s+/).filter(Boolean);
 if(parts.length > 1){ for(const p of parts){ const t = slipTip1([p]); if(t) return t; } return ""; }
 return slipTip1(heard);
}
function slipTip1(heard){
 const h = spNorm((heard||[]).join(" "));
 /* in a story about the past, a base verb after its subject is the slip — and the advice is
    the PAST form (Mei Fong: "my brother help me" was told "helps" in a story about last week) */
 if(PASTCTX.test(h)){
  // opinions stay present in a past story ("I think it was good"); "I have finished" is right
  const m = h.match(/\b(i|he|she|we|they|my (?:boss|manager|colleague|friend|sister|brother|mother|father|son|daughter)|mr tan|siti|kumar|ali) (?:(?:just|also|only|then|really) )?(break|go|eat|buy|come|take|make|get|meet|drive|leave|lose|forget|help|call|wait|lock|open|close|walk|finish|start|stay|visit|watch|play|cook|clean|tell|say|give|find|bring|send|pay|ride|run|fall|rest)\b(?! to\b)(?! (\w+ed|been|done|gone|seen|finished|already|just|to)\b)/);
  if(m && !/\b(will|can|could|would|should|must|to|did|do|does|not|when|if|let's|usually|always|often|every|help|helped)\s*$/.test(h.slice(0, m.index))) return `${m[1]} ${m[2]} → ${m[1]} ${pastOf(m[2])}`.replace(/\bi\b/g, "I");
 }
 for(const [re, fx] of SLIPS){ const m = h.match(re); if(m){ const r = fx(m, h); if(r) return r.replace(/\bi\b/g, "I"); } }
 return "";
}
/* A spoken answer that matches the words can still carry the lesson's own mistake: the
   lesson's `not` phrases, a named slip, or one of the item's decoy tiles (the wrong words it
   was built around, each with its reason). Any of them fails it, and says which. */
/* "Don't say X here" — and, when the slip rules know it, what to say instead (Chen and Aisyah,
   round 3: 「这里不能说「need doctor」」 never said what to say) */
function notMsg(bad, heard){
 const w = String(bad).replace(/\bi\b/g, "I"), m = fmt(T().ownNot, {w});
 const fx = notFix(bad), tip = fx ? w+" → "+fx : heard ? slipTip(heard) : "";
 return tip ? m+" 💡 "+tip : m;
}
function hardSlip(heard){
 const nots = lessonNots();
 for(const h of (heard||[]).map(x=>spNorm(x))){ const bad = nots.find(k=>(" "+h+" ").includes(" "+k+" ")); if(bad) return "not:"+notMsg(bad, heard); }
 /* Level 2 is Convey: a clear message with a small slip passes, with the slip as a tip; only the
    lesson's own mistakes fail it (round 2, Mei Ling: "it deliver", "the pipe very old") */
 if(typeof CONF!=="undefined" && CONF.flow==="l2") return "";
 const sl = slipTip(heard);
 return sl ? "slip:"+sl : "";
}
/* Whatever path passed (word for word, an alternative, the idea), the answer must not say the
   opposite of the lesson's own sentence, a different number, or a different place (round 3, Mei
   Ling: "the old supplier" passed via an alternative that has both old and new) */
function meaningGuard(main, heard){
 const TS = window.TouchSpeech; if(!TS || !TS.tokens) return "";
 const tt = TS.tokens(px(main)), P = ["ipoh","penang","kulai","kuantan","melaka","malacca","johor","kl","singapore","seremban","klang","muar","kluang","batu","pahat","segamat","skudai","gudang"];
 for(const h of (heard||[]).slice(0,1)){
  const hw = TS.tokens(h);
  for(const x of hw){ if(tt.includes(x)) continue; const y = tt.find(w=>!hw.includes(w) && TS.opposite(w, x)); if(y) return "meaning:"+y; }
  const tn = tt.filter(TS.isNumber), hn = hw.filter(TS.isNumber);
  // a number of the sentence said differently ("five" for three); an extra one ("eight thirty" for half past eight) is not
  if(hn.length && tn.some(x=>!hn.includes(x))) return "meaning:"+tn.find(x=>!hn.includes(x));
  const tp = tt.filter(w=>P.includes(w)), hp = hw.filter(w=>P.includes(w));
  if(tp.length && hp.some(x=>!tp.includes(x))) return "meaning:"+tp.find(x=>!hp.includes(x)).replace(/^./, c=>c.toUpperCase());
 }
 return "";
}
function decoyHit(heard, item, targets){
 if(!item || !item.x || !item.x.length) return "";
 if(typeof CONF!=="undefined" && CONF.flow==="l2") return "";   // Convey: "we're having a team lunch" is right in his own words
 const tt = " "+targets.map(x=>spNorm(x)).join(" | ")+" ";
 for(const d of item.x){
  const k = spNorm(px(d)); if(!k || /^[a-z]$/.test(k) || (STOPW.has(k) && !k.includes(" "))) continue;
  if(tt.includes(" "+k+" ")) continue;                         // a right answer has it too
  if(!heard.some(h=>(" "+spNorm(h)+" ").includes(" "+k+" "))) continue;
  const why = item.xw && (item.xw[d] || item.xw[k]);
  const W = ({zh:"这里不用 {w}。", ms:"{w} tidak sesuai di sini.", en:"Not {w} here."})[S.lang];
  return "decoy:"+fmt(W, {w: d})+(why ? " 💡 "+px(tri(why)) : "");
 }
 return "";
}
/* LEVEL 2 judges a spoken answer to a situation on its IDEAS, not its wording (Hafiz,
   2026-09-25: "I've finished the sales report. I'm still working on the stock list" was told
   「missing: and」). Level 1 is Construct — the sentence itself is the point, so it stays
   word-for-word; Level 2 is Convey — the message is. Passes when at least 70% of a model's
   content words (stems) are there, in 4+ words; days and numbers must still be right. */
// words of a mission prompt that say HOW to speak, not what about — they are in every answer, on topic or not
const MISSION_HOW = new Set("first then after that finally next usually always sometimes because felt feel feels speak talk tell give start take takes like went what where when which does with from your yours about real sentences sentence linked least once reason explain describe tells says think thought example opinion agree understand suggest because instance addition however also then before until could would please should will".split(" "));
function lessonNots(){
 const ex = ex0(); return [].concat((ex && ex.own) || []).flatMap(o=>o.not||[])   // Pre-Beginner's own is one object, not a list
 .map(k=>spNorm(k)).filter(Boolean);
}
function ideaCheck(targets, heard){
 /* judging the idea must not let the lesson's own target mistake through (Hafiz, round 2:
    "I'll finish it until five" passed the translation of "by five") — the lesson's `not`
    phrases and the common slips fail an otherwise right idea, and the slip is named */
 const nots = lessonNots();
 ideaCheck.slip = "";
 for(const h of (heard||[]).map(x=>spNorm(x))){
  const bad = nots.find(k=>(" "+h+" ").includes(" "+k+" "));
  if(bad){ ideaCheck.slip = bad; return false; }
 }
 // a common slip is a tip at Level 2, not a fail (the lesson's own mistakes are the nots above)
 /* everyday synonyms a learner says instead of the model's word (Mei Fong: "reached the office…
    my boss understood" for "got to work… my manager understood") */
 const SYN = {boss:"manager",supervisor:"manager",reached:"got",reach:"get",arrived:"got",arrive:"get",office:"work",workplace:"work",
  handphone:"phone",mobile:"phone",large:"big",huge:"big",small:"little",quick:"fast",quickly:"fast",begin:"start",began:"started",
  purchase:"buy",purchased:"bought",tired:"exhausted",glad:"happy",pleased:"happy",problem:"issue",trouble:"issue",
  inexpensive:"cheap",pricey:"expensive",costly:"expensive",ready:"done",finished:"done",completed:"done",complete:"done",
  motorbike:"motorcycle",car:"car",customer:"client",clients:"customers"};
 const tok = x=>((window.TouchSpeech && TouchSpeech.tokens) ? TouchSpeech.tokens(px(x)) : spNorm(px(x)).split(" ")).map(w=>SYN[w]||w);
 const cw = x=>tok(x).filter(w=>w && !STOPW.has(w) && !/^(the|a|an|and|but|so|very|really|just|also|too|now|then|that|this|it|is|am|are|was|were|be|of|on|at|in|for|to|with|by)$/.test(w));
 const said = (heard||[]).map(h=>tok(h).join(" ")).filter(Boolean);
 const NEG = /\b(not|never|no|nobody|nothing|cannot)\b|n't\b/;
 const DAY = /^(mon|tues|wednes|thurs|fri|satur|sun)day$|^\d+$/;
 let best = 0;
 for(const h of said){
  if(h.split(" ").length < 4) continue;
  const L = lemma(h);
  const hWords = h.split(" ");
  for(const t of targets){ const ws = cw(t); if(!ws.length) continue;
   // "my manager NEVER understood" is not "my manager understood": negation must agree
   if(NEG.test(tok(t).join(" ")) !== NEG.test(h)) continue;
   /* nor may one word turn it round: "the old supplier" for the new one, "angry" for happy, the
      night shift for the morning one; nor a different number (round 2, Mei Ling) */
   const TS = window.TouchSpeech, tt = tok(t);
   if(TS && TS.opposite && hWords.some(hw=>!tt.includes(hw) && tt.some(tw=>!hWords.includes(tw) && TS.opposite(tw, hw)))) continue;
   if(TS && TS.isNumber){ const tn = TS.tokens(t).filter(TS.isNumber), hn = TS.tokens(h).filter(TS.isNumber); if(hn.some(x=>!tn.includes(x)) && tn.length) continue; }
   // a day or a number: saying a DIFFERENT one is wrong; leaving it out (context gave it) is not
   const tDays = ws.filter(w=>DAY.test(w)), hDays = hWords.filter(w=>DAY.test(w));
   if(hDays.some(w=>!tDays.includes(w)) && tDays.length) continue;
   const core = ws.filter(w=>!DAY.test(w));
   best = Math.max(best, core.length ? core.filter(w=>L.includes(lemma(w))).length / core.length : 1); }
 }
 return best >= 0.6;
}
function ex0(){ return (P && lessonExtra(P.mi, P.li)) || {}; }
function lessonExtra(mi,li){ const c = COURSE[mi]; return (c && typeof LESSON_EXTRA!=="undefined" && LESSON_EXTRA[c.id+"-"+li]) || null; }
function sayable(s){ return px(s).replace(/\s+([.,!?;:])/g,"$1").replace(/\s+/g," ").trim(); }
function wordBlocks(n){                       // 7 → 3,2,2 · 8 → 3,3,2 · 10 → 3,3,2,2
 if(n<=3) return n ? [n] : [];
 const k = Math.ceil(n/3), base = Math.floor(n/k), extra = n%k;
 return Array.from({length:k}, (_,i)=>base + (i<extra?1:0));
}
/* a goal sentence may be a pattern ("My name is ___."): fill it the way the lesson does —
   the learner's own line that starts the same way, else the substitution's first word */
/* a pattern read aloud: each blank is a short pause ("It takes … minutes.") —
   tools/build-audio.mjs blankPause() is the same line, so the recording is found */
function blankPause(s){ return sayable(String(s).replace(/_{2,}/g,"…")).replace(/…\s*[.,;:]/g,"…"); }
function fillBlank(l, s){
 if(!/___/.test(s)) return sayable(s);
 const pre = s.split("___")[0].trim().toLowerCase();
 const y = ((l.d && l.d.lines) || []).find(x=>x.who==="Y" && x.ans && sayable(x.ans).toLowerCase().startsWith(pre) && pre);
 if(y) return sayable(y.ans);
 const sub = (l.s || []).find(x=>x.tpl===s || x.tpl.split("___")[0].trim().toLowerCase()===pre);
 if(sub && sub.bank && sub.bank[0] && s.split("___").length===2) return sayable(s.replace("___", sub.bank[0]));
 return "";
}
function repeatSentences(l, ex){
 const out = [], seen = {};
 const add = s=>{ if(!s) return; const k = s.toLowerCase(); if(seen[k] || /___/.test(s)) return; seen[k] = 1; out.push(s); };
 ((ex && ex.goalSay) || []).forEach(s=>add(fillBlank(l, s)));
 // without extras: the learner's lines that use this lesson's patterns, then the patterns
 // filled in, then any other line of theirs (longest first — the fullest sentence)
 const ys = ((l.d && l.d.lines) || []).filter(x=>x.who==="Y" && x.ans).map(x=>sayable(x.ans));
 ys.filter(y=>patternFor(l, y)).forEach(add);
 (l.p || []).forEach(p=>add(fillBlank(l, p.t)));
 ys.slice().sort((a,b)=>b.length-a.length).forEach(add);
 return out.slice(0,2);
}
function patternFor(l, s){
 const low = " "+spNorm(s)+" ";
 // every fixed part of the pattern must be in the sentence, not only its first words
 return (l.p || []).find(p=>{ const parts = px(p.t).split("___").map(x=>spNorm(x)).filter(Boolean);
  return parts.length && parts.every(x=>low.includes(" "+x+" ")); }) || null;
}
/* Level 1 and up: LESSON_EXTRA.own may be a LIST — answer the character, then ask them
   something (ask:true, judged on the question the learner asks). */
function ownsFor(l, ex){
 if(ex && Array.isArray(ex.own)) return ex.own.filter(o=>o && o.line).map(o=>({who:o.who||"amy", line:sayable(o.line), prompt:o.prompt||null, keys:o.keys||[], hint:"", ask:!!o.ask, must:o.must||null, not:o.not||null, model:o.model||"", exact:!!o.exact}));
 return [ownFor(l, ex)];
}
/* SAY IT YOURSELF: LESSON_EXTRA.own, else the dialogue's first line and the pattern */
function ownFor(l, ex){
 if(ex && ex.own && ex.own.line){
  return {who: ex.own.who || "amy", line: sayable(ex.own.line), prompt: ex.own.prompt || null, keys: ex.own.keys || [], hint:"",
   ask: !!ex.own.ask, must: ex.own.must || null, not: ex.own.not || null, model: ex.own.model || "", exact: !!ex.own.exact};
 }
 const lines = (l.d && l.d.lines) || [];
 const ai = lines.findIndex(x=>x.who!=="Y" && x.en);
 const a = ai>=0 ? lines[ai] : null;
 const y = lines.slice(ai+1).find(x=>x.who==="Y" && x.ans);
 const p = l.p && l.p[0];
 const keys = [];
 if(p) p.t.split("___").map(s=>s.replace(/[.,!?]/g,"").trim()).filter(Boolean).forEach(k=>keys.push(k));
 if(y) keys.push(sayable(y.ans));
 const line = a ? sayable(a.en) : "";
 let who = "amy";
 try{ who = (window.TouchCoach && TouchCoach.whoIn(line, [S.name])) || "amy"; }catch(e){}
 return {who, line, prompt:null, keys, hint: p ? px(p.t) : ""};
}
/* up to two questions from lessons already passed, two different kinds */
function reviewPicks(mi, li, want){
 want = want || 2;
 const doneL = (m,x)=> !!(COURSE[m] && S.done[COURSE[m].id+"-"+x]) && !(m===mi && x===li);
 const out = [];
 const push = r=>{
  if(out.length>=want || !r || !doneL(r.m, r.l)) return;
  const s = resolveRef(r);
  if(!s || out.some(o=>o.kind===s.kind || refKey(o.ref)===refKey(r))) return;
  s.rv = true; out.push(s);
 };
 S.review.slice().forEach(push);                 // oldest mistakes first: that is the spacing
 if(out.length<want){
  const pool = [];
  COURSE.forEach((m,a)=>m.lessons.forEach((L,b)=>{
   if(!doneL(a,b)) return;
   (L.f||[]).forEach((_,n)=>pool.push({m:a,l:b,k:"fill",n}));
   (L.m||[]).forEach((_,n)=>pool.push({m:a,l:b,k:"mcq",n}));
  }));
  shuffle(pool).forEach(push);
 }
 return out;
}
/* LEVEL 1 (research 2026-09-25, STATE §1i): from repeating toward saying things yourself.
   Against Pre-Beginner: the dialogue is HEARD first with no text (one gist question);
   words in blocks of 3; three review items; two translations, the second one SAID aloud;
   one listening item with no text; the learner's last dialogue line is SAID, not built;
   and two SAY IT YOURSELF — answer the character, then ask them something.
   Spoken steps give XP and never count toward the 70% (Marco 2026-09-25, 3B). */
function buildL1(mi, li){
 let pend = [];
 const l = COURSE[mi].lessons[li];
 const ex = lessonExtra(mi, li);
 const steps = [{kind:"goal"}];
 const boss = !!l.boss;
 const speech = !!(window.TouchSpeech && TouchSpeech.available);
 if(!boss && ex && ex.gist && l.d && TTS) steps.push({kind:"gist"});
 if(!boss){
  let at = 0;
  const blocks = wordBlocks(l.w.length);
  blocks.forEach((n,b)=>{
   const idx = Array.from({length:n}, (_,i)=>at+i); at += n;
   steps.push({kind:"meet", idx, last: b===blocks.length-1});
   // Level 1 learners know many of these words (student test 2026-09-25): one listening check per two blocks
   pend = pend.concat(idx);
   if(TTS && (b%2===1 || b===blocks.length-1)){ steps.push({kind:"hearpick", idx: pend, last: b===blocks.length-1}); pend = []; }
  });
  repeatSentences(l, ex).forEach((s,i)=>steps.push({kind:"repeat", say:s, n:i, first:i===0}));
 }
 if(!boss) reviewPicks(mi, li, 3).forEach(s=>steps.push(s));
 const pick = f=>{ const a = l[f]||[]; if(!a.length) return null; const n = Math.floor(Math.random()*a.length); return {it:a[n], n}; };
 if(boss){
  /* two of each kind, dealt in turn (walkthrough 2026-09-25: the whole bank made a 39-screen
     Boss of the same five drills; the dialogue and the mission are the real test) */
  const ORDER = [["fill","f"],["order","o"],["mcq","m"],["subst","s"],["trans","tr"]];
  const decks = ORDER.map(([k,f])=>shuffle((l[f]||[]).map((it,n)=>({kind:k,it,n}))).slice(0,2));
  for(let r=0; decks.some(d=>d.length); r++) decks.forEach(d=>{ const s = d.shift(); if(s) steps.push(s); });
 } else {
  const trs = shuffle((l.tr||[]).map((it,n)=>({it,n})));
  [["fill","f"],["order","o"]].forEach(([k,f])=>{ const x = pick(f); if(x) steps.push(Object.assign({kind:k}, x)); });
  if(trs[0]) steps.push(Object.assign({kind:"trans"}, trs[0]));
  { const x = pick("m"); if(x) steps.push(Object.assign({kind:"mcq"}, x)); }
  { const x = pick("s"); if(x) steps.push(Object.assign({kind:"subst"}, x)); }
  if(trs[1]) steps.push(Object.assign({kind: speech ? "strans" : "trans"}, trs[1]));
  ((ex && ex.listen) || []).slice(0,1).forEach((it,n)=>{ if(TTS) steps.push({kind:"listenonly", it, n}); });
 }
 steps.push({kind:"dialog", speakLast: speech});
 if(!boss) ownsFor(l, ex).forEach(o=>{ if(o.line) steps.push(Object.assign({kind:"own"}, o)); });
 if(boss && speech && ex && ex.mission) steps.push({kind:"mission"});
 return steps;
}
/* LEVEL 2 (research 2026-09-25, STATE §1i): CONVEY. The conversation is HEARD first (lines
   heard, replies matched); words in blocks of up to 4; one 跟着说; four review items; one each
   of fill, sentence order, best-response choice; two translations SAID from an English
   situation cue; a heard-only question; the dialogue with the other person heard before
   read; then a 15-second planning card and SAY IT YOURSELF in 2–3 turns with one person.
   The Boss has no hints and must reach 70% to open the next unit (CONF.gateUnits). */
function buildL2(mi, li){
 const l = COURSE[mi].lessons[li];
 const ex = lessonExtra(mi, li);
 const steps = [{kind:"goal"}];
 const boss = !!l.boss;
 const speech = !!(window.TouchSpeech && TouchSpeech.available);
 if(!boss && l.cm && l.cm.pairs && TTS) steps.push({kind:"convo"});
 if(!boss){
  let at = 0;
  const n = l.w.length, k = Math.ceil(n/4), blocks = Array.from({length:k}, (_,i)=>Math.floor(n/k) + (i < n%k ? 1 : 0));
  blocks.forEach((c,b)=>{
   const idx = Array.from({length:c}, (_,i)=>at+i); at += c;
   steps.push({kind:"meet", idx, last: b===blocks.length-1});
   if(TTS) steps.push({kind:"hearpick", idx, last: b===blocks.length-1});
  });
  repeatSentences(l, ex).slice(0,1).forEach((s,i)=>steps.push({kind:"repeat", say:s, n:i, first:i===0}));
 }
 if(!boss) reviewPicks(mi, li, 4).forEach(s=>steps.push(s));
 if(boss){
  const ORDER = [["fill","f"],["order","o"],["mcq","m"],["ls","ls"],["subst","s"],["trans","tr"]];
  const decks = ORDER.map(([k,f])=>shuffle((l[f]||[]).map((it,n)=>({kind:k,it,n}))).slice(0,2));
  for(let r=0; decks.some(d=>d.length); r++) decks.forEach(d=>{ const s = d.shift(); if(s) steps.push(s); });
 } else {
  const pick = f=>{ const a = l[f]||[]; if(!a.length) return null; const n = Math.floor(Math.random()*a.length); return {it:a[n], n}; };
  const trs = shuffle((l.tr||[]).map((it,n)=>({it,n})));
  { const x = pick("f"); if(x) steps.push(Object.assign({kind:"fill"}, x)); }
  { const x = pick("o"); if(x) steps.push(Object.assign({kind:"order"}, x)); }
  if(trs[0]) steps.push(Object.assign({kind: speech ? "strans" : "trans"}, trs[0]));
  { const x = pick("m"); if(x) steps.push(Object.assign({kind:"mcq"}, x)); }
  { const x = pick("ls"); if(x && TTS) steps.push(Object.assign({kind:"ls"}, x)); }
  { const x = pick("s"); if(x) steps.push(Object.assign({kind:"subst"}, x)); }
  if(trs[1]) steps.push(Object.assign({kind: speech ? "strans" : "trans"}, trs[1]));
 }
 steps.push({kind:"dialog", speakLast: speech});
 if(!boss){
  const owns = ownsFor(l, ex).filter(o=>o.line);
  if(owns.length && speech) steps.push({kind:"plan", who: owns[0].who, prompt: owns[0].prompt});
  owns.forEach(o=>steps.push(Object.assign({kind:"own"}, o)));
  // "now say it all in one go" — the formula whole, in the learner's own words (Mei Fong never did, outside the Boss)
  if(speech && ex && ex.mission) steps.push({kind:"mission"});
 }
 if(boss && speech && ex && ex.mission) steps.push({kind:"mission"});
 return steps;
}
function buildLessonSteps(mi, li){
 if(typeof CONF!=="undefined" && CONF.flow==="l1") return buildL1(mi, li);
 if(typeof CONF!=="undefined" && CONF.flow==="l2") return buildL2(mi, li);
 const l = COURSE[mi].lessons[li];
 const ex = lessonExtra(mi, li);
 const steps = [{kind:"goal"}];
 const boss = !!l.boss;
 if(!boss){
  let at = 0;
  const blocks = wordBlocks(l.w.length);
  blocks.forEach((n,b)=>{
   const idx = Array.from({length:n}, (_,i)=>at+i); at += n;
   steps.push({kind:"meet", idx, last: b===blocks.length-1});
   if(TTS) steps.push({kind:"hearpick", idx, last: b===blocks.length-1});
  });
  repeatSentences(l, ex).forEach((s,i)=>steps.push({kind:"repeat", say:s, n:i, first:i===0}));
 }
 reviewPicks(mi, li).forEach(s=>steps.push(s));
 const ORDER = [["fill","f"],["order","o"],["mcq","m"],["subst","s"],["trans","tr"]];
 if(boss){
  // the Boss keeps its whole set, dealt round-robin so no two of a kind sit together
  const decks = ORDER.map(([k,f])=>shuffle((l[f]||[]).map((it,n)=>({kind:k,it,n}))));
  for(let r=0; decks.some(d=>d.length); r++) decks.forEach(d=>{ const s = d.shift(); if(s) steps.push(s); });
 } else {
  ORDER.forEach(([k,f])=>{ const a = l[f]||[]; if(!a.length) return; const n = Math.floor(Math.random()*a.length); steps.push({kind:k, it:a[n], n}); });
 }
 steps.push({kind:"dialog"});
 const own = ownFor(l, ex);
 if(own.line) steps.push(Object.assign({kind:"own"}, own));
 return steps;
}
/* A lesson left half-way (the app closed, the phone locked) can be picked up again for a day
   (student test 2026-09-25: a reload at step 12 of 23 went back to the map with the XP gone). */
function saveRun(){ try{ if(P && P.mode==="lesson") store.set("run", {at:Date.now(), P}); }catch(e){} }
function startLesson(mi,li){
 const run = store.get("run", null);
 if(run && run.P && run.P.mi===mi && run.P.li===li && run.P.idx>1 && run.P.idx<run.P.steps.length && Date.now()-run.at < 864e5){
  const t = T();
  askConfirm(fmt(t.resumeQ, {n: Math.min(run.P.idx+1, run.P.base || run.P.steps.length)}), t.resumeYes, t.resumeNo, ()=>{
   P = run.P; $("combochip").classList.add("hidden"); show("scr-play"); renderStep();
  }, false);
  const no = document.getElementById("mNo");
  if(no) no.onclick = ()=>{ closeOvl(); store.set("run", null); startLesson(mi, li); };
  return;
 }
 const steps = buildLessonSteps(mi, li);
 P = {mi,li,steps,idx:0,xp:0,right:0,total:0,wrongs:[],combo:0,mode:"lesson",redoKeys:{}};
 $("combochip").classList.add("hidden");
 show("scr-play");
 renderStep();
}
$("quitbtn").onclick = ()=>{ askConfirm(T().quit, T().quitYes, T().quitNo, ()=>{ try{ store.set("run", null); }catch(e){} P=null; hideFeedback(); killRec(); renderHome(); }, true); };

/* The finish line stays where it was (walkthrough 2026-09-25: every mistake added a redo
   step, so "10/16" became "12/18" and the bar shrank — worst for whoever is struggling).
   P.base is the lesson's own length; the redo steps after it are counted on their own. */
function baseLen(){ return (P && (P.base || (P.base = P.steps.filter(x=>!x.redo).length))) || 1; }
function setProg(){
 $("progfill").style.width = Math.min(100, Math.round(Math.min(P.idx, baseLen())/baseLen()*100))+"%";
 $("sessxp").textContent = P.xp;
}
function award(xp,correct){
 const st = (P.steps && P.steps[P.idx]) || {};
 /* A second go (the redo at the end of a lesson) earns no XP, but a right answer now counts HALF
    toward the pass mark (Marco 2026-09-25, B: a learner who fixes a mistake has learnt something;
    one who got half wrong and fixed most of it can reach 70%, one who fixed nothing cannot). */
 if(st.redo){ if(correct && !st.rv) P.right += 0.5; return 0; }
 if(!st.rv) P.total++;                          // another lesson's question does not decide this one
 if(correct){
  if(!st.rv) P.right++;
  P.combo = (P.combo||0)+1;
  if(P.combo>=3) xp += 2;                        // combo bonus
 } else { P.combo = 0; xp = 0; }
 P.xp += xp;
 $("sessxp").textContent = P.xp;
 const c = $("combochip");
 if(P.combo>=2){ c.textContent = "🔥×"+P.combo; c.classList.remove("hidden"); }
 else c.classList.add("hidden");
 return xp;                                       // actual XP gained (for the feedback sheet)
}
function xpFloat(n){
 if(REDUCED || n<=0) return;
 const d=document.createElement("div");
 d.className="xpfloat"; d.textContent="+"+n+" XP";
 document.body.appendChild(d);
 setTimeout(()=>d.remove(),1100);
}
/* Duolingo-style bottom feedback sheet */
/* The answer sheet (restyled 2026-09-25): green 「答对了！」 + one line of why, or red
   「正确答案：」 + the answer + why + 「这题会放进你的复习」 when it went into the pool.
   On the right, 太简单 · 太难 · 报错 → TouchReport (shared/report.js); they never touch
   the score. Without TouchReport the toast still shows, so the screen behaves the same. */
function showFeedback(ok, opts){
 const t = T();
 const fb = $("feedback");
 fb.className = ok ? "ok" : "no";
 $("fbic").textContent = ok ? "✓" : "✗";
 let title = ok ? t.fbRight : t.fbAnswer;
 if(ok && S.name && Math.random()<0.4) title = title.replace(/[!！]$/, S.lang==="zh" ? "，"+S.name+"！" : ", "+S.name+"!");
 const comboTxt = (ok && P && P.combo>=3) ? ` · 🔥×${P.combo}` : "";
 $("fbtitle").textContent = title;
 $("fbxp").textContent = (((ok && opts.xp>0) ? "+"+opts.xp+" XP" : "") + comboTxt).replace(/^ · /, "");
 $("fbmeaning").textContent = opts.meaning ? (t.meaningIs+" "+opts.meaning) : "";
 $("fbmeaning").style.display = opts.meaning ? "" : "none";
 /* 学生用另一种正确说法答对（alt）：照样算对，再给他看标准答案当参考 */
 const corrTxt = ok ? (opts.also ? t.alsoCorrect+" "+opts.also : "") : (opts.correct || "");
 $("fbcorr").textContent = px(corrTxt);
 $("fbcorr").style.display = corrTxt ? "" : "none";
 /* a wrong answer's right sentence can be heard, on purpose (English only) */
 const sayCorr = !opts.quiet && !ok && corrTxt && /[A-Za-z]/.test(corrTxt) && !/[\u3400-\u9fff]/.test(corrTxt) ? corrTxt.replace(/\s+([.,!?;:])/g,"$1").trim() : "";
 /* a right built sentence can be heard again (Marco 2026-09-26): the sentence, with its ♪ */
 const replay = (ok && opts.replay && !opts.quiet && !corrTxt) ? String(opts.replay).replace(/\s+([.,!?;:])/g,"$1").trim() : "";
 $("fbcorr").classList.remove("heard");
 if(sayCorr){ $("fbcorr").setAttribute("data-say", sayCorr); $("fbcorr").setAttribute("role","button"); $("fbcorr").textContent = px(corrTxt); }
 else if(replay){ $("fbcorr").setAttribute("data-say", replay); $("fbcorr").setAttribute("role","button"); $("fbcorr").textContent = px(replay); $("fbcorr").style.display = ""; $("fbcorr").classList.add("heard"); }
 else { $("fbcorr").removeAttribute("data-say"); $("fbcorr").removeAttribute("role"); }
 /* a wrongly built sentence: what was built, the answer with the replaced words marked, why */
 const D = (!ok && BUILT_DIFF) ? BUILT_DIFF : null; BUILT_DIFF = null;
 let dv = $("fbdiff"), dw = $("fbdiffwhy");
 if(!dv){ dv = document.createElement("div"); dv.id = "fbdiff"; dv.className = "fb-diff"; $("fbcorr").before(dv); }
 if(!dw){ dw = document.createElement("div"); dw.id = "fbdiffwhy"; dw.className = "fb-diffwhy"; $("fbcorr").after(dw); }
 dv.innerHTML = D ? `<span class="fbd-l">${D.you}</span> <span class="fbd-s">${D.built}</span>` : ""; dv.style.display = D ? "" : "none";
 dw.innerHTML = D ? D.lines.map(l=>`<div>${l}</div>`).join("") : ""; dw.style.display = D && D.lines.length ? "" : "none";
 if(D && sayCorr) $("fbcorr").innerHTML = px(D.answer);
 $("fbexpl").textContent = px(opts.expl || "");
 $("fbexpl").style.display = opts.expl ? "" : "none";
 const pooled = !ok && P && P.last && P.last.pooled;
 $("fbnotel").textContent = t.fbPooled;
 $("fbnote").style.display = pooled ? "" : "none";
 fbTools();
 const btn = $("fbbtn");
 btn.textContent = t.continue;
 /* the sheet's Continue sits where Check was: a double tap would skip the answer unread */
 const shownAt = Date.now();
 btn.onclick = ()=>{ if(Date.now()-shownAt < 700) return; hideFeedback(); opts.onContinue(); };
 fb.classList.add("show");
 ensureFeedbackReachable();
 if(ok) xpFloat(opts.xp);
}
function fbReportBase(kind){
 const last = (P && P.last) || {};
 const ref = Object.assign({lesson: P && P.mode==="lesson" ? COURSE[P.mi].id+"-"+P.li : "review"}, last.ref || {});
 return {course:CONF.id, kind, ref, question: last.question || "", answer: last.given || ""};
}
function fbTools(){
 const t = T();
 $("fbeasyl").textContent = t.fbEasy; $("fbhardl").textContent = t.fbHard; $("fbflagl").textContent = t.fbFlag;
 ["fbeasy","fbhard"].forEach(id=>{
  const b = $(id), kind = id==="fbeasy" ? "easy" : "hard";
  b.classList.remove("on");
  b.setAttribute("aria-pressed","false");
  b.onclick = ()=>{
   if(b.classList.contains("on")) return;
   ["fbeasy","fbhard"].forEach(x=>$(x).classList.remove("on"));
   b.classList.add("on"); b.setAttribute("aria-pressed","true");
   let h = null;
   try{ h = window.TouchReport ? TouchReport.send(fbReportBase(kind)) : null; }catch(e){}
   undoToast(t.noted, t.undo, ()=>{ try{ h && h.undo && h.undo(); }catch(e){} b.classList.remove("on"); b.setAttribute("aria-pressed","false"); });
  };
 });
 $("fbflag").classList.remove("on");
 $("fbflag").onclick = ()=>reportSheet();
}
function undoToast(msg, undoTxt, onUndo){
 document.querySelectorAll(".toast.undo").forEach(x=>x.remove());
 const el = document.createElement("div");
 el.className = "toast undo";
 el.innerHTML = `<span>${esc(msg)}</span><button type="button">${esc(undoTxt)}</button>`;
 document.body.appendChild(el);
 const kill = ()=>{ el.style.opacity="0"; el.style.transition="opacity .25s"; setTimeout(()=>el.remove(),260); };
 const tm = setTimeout(kill, 4800);                // report.js sends after 5 s: undo must stay reachable until then
 el.querySelector("button").onclick = ()=>{ clearTimeout(tm); onUndo(); kill(); };
}
function reportSheet(){
 const t = T();
 const ids = ["accept_my_answer","audio","unclear","other"];
 const o = sheet(`<h3>${esc(t.repTitle)}</h3><div style="height:8px"></div>
  ${t.repReasons.map((r,i)=>`<label class="repopt"><input type="checkbox" value="${ids[i]}"><span>${esc(r)}</span></label>`).join("")}
  <div class="sheetrow"><button class="btn btn-ghost" id="repNo">${esc(t.repCancel)}</button>
  <button class="btn btn-primary" id="repGo" disabled>${esc(t.repSend)}</button></div>`);
 const boxes = [...o.querySelectorAll("input[type=checkbox]")];
 boxes.forEach(b=>b.onchange = ()=>{ o.querySelector("#repGo").disabled = !boxes.some(x=>x.checked); });
 o.querySelector("#repNo").onclick = closeOvl;
 o.querySelector("#repGo").onclick = ()=>{
  const reasons = boxes.filter(x=>x.checked).map(x=>x.value);
  try{ if(window.TouchReport) TouchReport.send(Object.assign(fbReportBase("report"), {reasons})); }catch(e){}
  closeOvl();
  $("fbflag").classList.add("on");
  toast(esc(t.repSent));
 };
}
function hideFeedback(){
 const fb=$("feedback");
 fb.classList.remove("show","inflow");
 fb.className=fb.className.replace(/\b(ok|no)\b/g,"").trim();
 document.body.classList.remove("fb-open");
 const w=document.querySelector(".wrap"); if(w) w.style.paddingBottom="";
}

/* 这一页是不是被嵌在别的页面里。跨网域读不到 window.top 会丢例外 ——
   丢例外本身就代表被嵌住了，所以当成 true。 */
const EMBEDDED = (function(){ try{ return window.self !== window.top; }catch(e){ return true; } })();
if(EMBEDDED) document.body.classList.add("embedded");   // the Check bar follows the content inside an iframe, like #feedback.inflow

/* 确保 Continue 一定点得到。

   判断刻意不量「现在的位置」—— 面板有 .35s 的滑入动画，量到一半会误判
   （我第一版就是这样，好好的浮动列被误判成碰不到）。改成用固定的几何事实判断：

   浮动列是 position:fixed;bottom:0，settle 之後底边一定贴着视窗底部，
   Continue 又是面板最後一个元素，所以「只要面板放得进视窗，就一定点得到」。
   真正会出事的只有两种情况，两种都不用等动画就知道：

     1) 被嵌在别的页面里（iframe）—— 浮动列钉在 iframe 自己的视窗底部，
        外层页面不一定露得出来。这就是学员遇到的情况。
     2) 视窗比面板还矮，或浏览器自己的工具列压在上面
        （visualViewport 比 innerHeight 矮）。

   这两种就不浮动，改成跟着内容排再卷进视野；其余维持原本的浮动列。 */
function ensureFeedbackReachable(){
 const fb=$("feedback"), btn=$("fbbtn");
 if(!fb||!btn) return;
 document.body.classList.add("fb-open");
 const wrap = document.querySelector(".wrap");

 const vh = window.innerHeight;
 const vvh = (window.visualViewport && window.visualViewport.height) || vh;
 const covered = vvh < vh - 8;              // 浏览器工具列压着视窗底部
 const tooTall = fb.offsetHeight > vvh - 8; // 面板比视窗还高（offsetHeight 不受 transform 影响）

 if(EMBEDDED || covered || tooTall){
  fb.classList.add("inflow");
  if(wrap) wrap.style.paddingBottom="";
  try{ btn.scrollIntoView({block:"end", behavior:"auto"}); }
  catch(e){ try{ btn.scrollIntoView(false); }catch(e2){} }
  return;
 }

 /* 维持浮动列 —— 把内容底部垫高，免得面板盖住选项和 Check */
 if(wrap) wrap.style.paddingBottom = (fb.offsetHeight + 40) + "px";

 /* 保险：滑入靠的是 CSS transition。分页在背景、或 iframe 在画面外时，
    浏览器会把动画节流甚至冻住 —— 面板就一直停在画面外（transform 还是
    translateY(110%)），可是 class 明明已经是 show，不会再触发第二次动画，
    学生怎么划都没反应。这时候把 transition 拿掉让它直接跳到定位。 */
 const settle = function(){
  if(!fb.classList.contains("show") || fb.classList.contains("inflow")) return;
  const tf = getComputedStyle(fb).transform;
  if(tf && tf !== "none" && tf !== "matrix(1, 0, 0, 1, 0, 0)"){
   fb.style.transition = "none";
   void fb.offsetWidth;          // 强制套用，之後再还原才不会又animate一次
   fb.style.transition = "";
  }
 };
 setTimeout(settle, 500);
 setTimeout(settle, 1400);
 document.addEventListener("visibilitychange", settle, {once:true});
}


/* =============================================================================
   测试模式（只给 Marco 用，学生看不到）

   网址加上 ?test=1 就会出现一条工具列：可以直接跳到任何一个步骤、
   跳过要做完练习才能过的关卡、boss 也能直接进。

   为什么用网址参数而不是按钮：学生不会知道这个参数，也不会误触；
   而且一关掉分页就没了，不会留在他们的装置上。
============================================================================= */
/* 在平台里只有员工帐号能开（不然学生加 ?test=1 就能跳过 boss）；单机测试照旧 */
const TESTMODE = (/[?&]test=1/.test(location.search) || location.hash === "#test")
  && (!TouchStore.platform || TouchStore.staff);

function testBar(){
 if(!TESTMODE) return;
 let bar = document.getElementById("testbar");
 if(!bar){
  bar = document.createElement("div");
  bar.id = "testbar";
  document.body.appendChild(bar);
 }
 const inLesson = P && P.steps && P.steps.length;
 const opts = inLesson ? P.steps.map((st,i)=>
   `<option value="${i}"${i===P.idx?" selected":""}>${i+1}. ${st.kind}</option>`).join("") : "";
 bar.innerHTML = `<span class="tb-tag">TEST</span>` + (inLesson
   ? `<button id="tb-prev">‹</button>
      <select id="tb-jump">${opts}</select>
      <button id="tb-next">›</button>
      <button id="tb-skip">跳过这一步</button>
      <button id="tb-end">直接到结算</button>`
   : `<span class="tb-hint">全部课程已解锁，随便点一课</span>`);

 if(inLesson){
  const go = i => { P.idx = Math.max(0, Math.min(P.steps.length-1, i)); renderStep(); testBar(); };
  document.getElementById("tb-prev").onclick = ()=>go(P.idx-1);
  document.getElementById("tb-next").onclick = ()=>go(P.idx+1);
  document.getElementById("tb-skip").onclick = ()=>go(P.idx+1);
  document.getElementById("tb-jump").onchange = e=>go(+e.target.value);
  document.getElementById("tb-end").onclick = ()=>finishLesson();
 }
}

/* 每次画面换了就重画工具列（步骤下拉要跟着目前进度走） */
if(TESTMODE){
 const _renderStep = renderStep;
 renderStep = function(){ _renderStep.apply(this, arguments); testBar(); };
 const _renderHome = renderHome;
 renderHome = function(){ _renderHome.apply(this, arguments); testBar(); };
 document.addEventListener("DOMContentLoaded", testBar);
 setTimeout(testBar, 300);
}

/* a double tap on Continue must not skip the next screen (round 2: two new-word screens in a
   row, and a double tap jumped over three words). Its Continue answers only after 450 ms. */
let STEP_AT = 0;
document.addEventListener("click", e=>{
 const b = e.target.closest && e.target.closest("#go");
 if(b && Date.now()-STEP_AT < 450){ e.stopPropagation(); e.preventDefault(); }
}, true);
function nextStep(){
 STEP_AT = Date.now();
 P.idx++;
 if(P.idx>=P.steps.length){ try{ store.set("run", null); }catch(e){} return finishLesson(); }
 saveRun();
 renderStep();
}
let STEP_TAG = "";   // "复习 · 第 n 课" / "再练一次" on the step being drawn (renderStep sets it)
function stepShell(lbl, title, sub, inner, footBtn){
 // a screen that places the character itself (goal card, SAY IT YOURSELF) gets no header one
 const slot = /data-coach/.test(inner) ? "" : `<span class="coachslot" data-coach></span>`;
 if(P && P.steps && P.steps[P.idx] && P.steps[P.idx].redo) lbl = String(lbl).replace(/ · \+\d+ XP/, "");   // a redo earns nothing
 return `<div class="stepcard">
  <div class="stephead">${slot}<div class="stephtext">
  ${STEP_TAG}<div class="steplbl">${esc(lbl)}</div>
  <div class="qtext">${title}</div>
  ${sub?`<div class="qsub">${esc(sub)}</div>`:""}
  </div></div>
  ${inner}
  <div class="pfoot">${footBtn}</div>
 </div>`;
}

/* ---- Student View (staff preview, shared/storage.js ?as=student) ----
   Marco 2026-09-25: staff see the student's screens but must not get stuck the way a
   student does — every lesson opens (no locks, no off-path suggestion) and a Skip
   button walks through a lesson step by step. Real students never have PREVIEW. */
if(PREVIEW){ const sk = document.getElementById("pskip"); if(sk){ sk.classList.remove("hidden"); sk.textContent = ({zh:"跳过 ›", ms:"Langkau ›", en:"Skip ›"})[S.lang] || "Skip ›"; sk.onclick = ()=>{ try{ hideFeedback(); }catch(e){} nextStep(); }; } }

/* ---- Amy in the lesson (shared/coach.js) ----
   Marco 2026-09-24: the character should fit what is on screen, like Duolingo.
   Her pose follows the kind of step, then turns to celebrate / think when the
   answer is checked. The pose change is the animation (see coach.js). */
let COACH = null;
const COACH_POSE = { convo:"listen", plan:"think", mission:"talk", gist:"listen", listenonly:"listen", strans:"talk", vocab:"talk", listen:"listen", ls:"listen", convo:"listen", patterns:["point",true], subst:["point",true], dialog:"talk", speak:"talk",
 goal:"wave", meet:"talk", hearpick:"listen", repeat:"talk", own:"talk" };
const COACH_H = { goal:170, own:150 };
function coachStep(){
 const slot = document.querySelector("#stepbox [data-coach]");
 if(!slot || !window.TouchCoach){ COACH = null; return; }
 // a step that already has Amy beside a speech bubble (mascotBubble) keeps her there,
 // full body and pointing at the bubble, instead of showing her twice
 const bubbleAmy = document.querySelector("#stepbox .mascot .coach-wrap");
 if(bubbleAmy){
  slot.remove();
  const k = P && P.steps && P.steps[P.idx] && P.steps[P.idx].kind;
  // the person the sentence is about steps in (Mr. Tan for "Good morning, Mr. Tan."),
  // never the learner's own name; otherwise Amy points at the bubble
  const bubble = document.querySelector("#stepbox .bubble");
  const own = (window.TouchVoice && TouchVoice.names) || [];
  const who = TouchCoach.whoIn(bubble ? bubble.textContent : "", own.concat([S && S.name]));
  const greet = bubble && /\b(hello|hi|good (morning|afternoon|evening)|goodbye|bye)\b/i.test(bubble.textContent);
  COACH = TouchCoach.mount(bubbleAmy,
    COACH_POSE[k] === "listen" ? { who: who || "amy", pose: "listen", height: 150 }
    : who ? { who, pose: greet ? "wave" : "talk", height: 150 }
    : { pose: "point", mirror: true, height: 150 });
  return;
 }
 const st = P && P.steps && P.steps[P.idx];
 const m = (st && COACH_POSE[st.kind]) || "idle";
 const [pose, mirror] = Array.isArray(m) ? m : [m, false];
 // SAY IT YOURSELF: the person asking (LESSON_EXTRA own.who) stands there, not Amy
 const who = (st && st.kind==="own" && st.who) || undefined;
 COACH = TouchCoach.mount(slot, { who, pose, mirror, height: (st && COACH_H[st.kind]) || 96 });
}
{ const _renderStep = renderStep; renderStep = function(){ const r = _renderStep.apply(this, arguments); coachStep(); return r; }; }
{ const _showFeedback = showFeedback; showFeedback = function(ok){ const r = _showFeedback.apply(this, arguments); if(COACH) COACH.pose(ok ? "celebrate" : "think"); return r; }; }
/* ---- the review label: 「复习 · 第 n 课」, with the unit when it is another unit's ---- */
function reviewTagText(r){
 const t = T(), L = COURSE[r.m] && COURSE[r.m].lessons[r.l];
 if(L && L.boss) return fmt(t.reviewTagB, {u:r.m+1});
 return (P && r.m===P.mi) ? fmt(t.reviewTag, {l:r.l+1}) : fmt(t.reviewTagU, {u:r.m+1, l:r.l+1});
}

/* ---- SAY IT YOURSELF matching (content conversation + reviewer, 2026-09-25) ----
   own.keys are alternatives: any ONE is enough, matched as whole words / phrases on
   TouchSpeech.normalize() of EVERY transcript the recogniser offers ("hi amy" must not
   pass "i am"). An answer that only repeats the character's own line does not count. */
function spNorm(s){
 if(window.TouchSpeech && TouchSpeech.normalize) return TouchSpeech.normalize(s);
 return String(s||"").toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
}
const GREET = /\b(hello|hi|good (morning|afternoon|evening|night)|bye|goodbye)\b/;
/* A greeting answers a greeting only if it fits: "good morning" answers "Good morning!",
   so do "morning", "hello" and "hi" — but not "good evening" or "bye", the very mistakes
   Lesson 1 teaches against (walkthrough re-check 2026-09-25). A goodbye wants a goodbye. */
function greetFits(line, n){
 const bye = x=>/\b(bye|goodbye|see you)\b/.test(x);
 if(bye(line)) return bye(n);
 if(bye(n)) return false;
 const part = x=>(x.match(/\b(?:good )?(morning|afternoon|evening|night)\b/)||[])[1] || "";
 const want = part(line), got = part(n);
 if(got) return got===want;
 return /\b(hello|hi)\b/.test(n);
}
/* Keys and mission phrases match the IDEA, not one fixed wording (student test 2026-09-25:
   "I'm working in a warehouse" failed "i work in"; "When do you wake up?" failed as "not a
   question"). Both sides are reduced to word stems with am/is/are dropped before an -ing
   form, so "i am working in" meets "i work in". Grammar is judged elsewhere (the spoken
   repeat and translation); here what counts is saying the thing. */
function lemma(t){
 return " "+String(t).replace(/\b(am|is|are)\s+(\w+ing)\b/g, "$2").split(/\s+/).filter(Boolean)
  .map(w=>w.length>4 ? w.replace(/(ing|ed|es|s)$/, "").replace(/e$/, "") : w).join(" ")+" ";
}
function lemmaHit(hay, key){ const k = spNorm(px(key)); return hay.includes(" "+k+" ") || (!OWN_EXACT && lemma(hay.trim()).includes(lemma(k))); }
const QWORD = /^(where|when|what|which|who|whose|why|how|do|does|did|are|is|was|were|can|could|would|will|have|has)\b/;
/* a question word straight into its subject — "where you live", "how you today": are/do/did is missing */
const NOAUX = /^(how|where|what|when|which|who|why)( (time|much|many|long|often))? (you|he|she|they|it|we)\b/;
/* "Where the clinic is?" — the statement order kept in a question (walkthrough 2026-09-26) */
const NOAUX2 = /^(where|what|when|who|how) (the|a|an|my|your|his|her|our|this|that) [a-z ]+ (is|are)$/;
const STOPW = new Set("i you he she it we they a an the do does did is are am was were to in at on of for and but my your his her our what where when which who how can could would will have has please".split(" "));
/* own.exact: a turn that teaches a TENSE matches its keys word for word — stems would let
   "I work in the office" pass for "I am working…", or "I visit" for "I visited". */
let OWN_EXACT = false;
/* the part of what was said from its first question word on, when at least three words follow */
function questionPart(n){
 const w = n.split(" ");
 for(let i=0;i<w.length-2;i++) if(QWORD.test(w[i])) return w.slice(i).join(" ");
 return n;
}
function ownHit(h, keys, line, ask){
 const n = spNorm(h);
 if(!n) return false;
 const L = spNorm(line);
 /* Answering a greeting with the same greeting is the right answer (walkthrough 2026-09-25:
    Siti says "Good morning!", the learner says "good morning", and was told ✗). Only a
    QUESTION echoed back is not an answer; and any greeting answers a greeting. */
 if(/\?\s*$/.test(String(line||"")) && L && (" "+L+" ").includes(" "+n+" ")) return false;
 /* …but only when the task IS the greeting: "Good morning, boss" does not apologise, and
    "Hi Ali how are you" does not tell him where you live (walkthrough 2026-09-26) */
 const keysGreet = !(keys||[]).length || (keys||[]).every(k=>GREET.test(spNorm(px(k))));
 if(!ask && keysGreet && GREET.test(L) && !/\?\s*$/.test(String(line||"")) && GREET.test(n)) return greetFits(L, n);
 const hay = " "+n+" ";
 const name = spNorm(S.name || PRACTICE_NAME);
 /* An "ask them" turn: a real question (with its are/do/did) that covers most of what one of the
    keys asks about — "When do you wake up?" meets "what time do you wake up"; "What time do you
    start work?" does not. (Round 2 of the student test: matching on ONE shared word let "Could
    you speak English?" and "So the meeting is on Tuesday…" through.) An answer needs one of its
    key phrases, word stems allowed ("I'm working in" meets "i work in"). */
 /* the question can follow a greeting ("Hi, nice to meet you, how are you?" — walkthrough
    2026-09-26: judged from its first word, "Hi", it was told it was not a question) */
 const qn = ask ? questionPart(n) : n;
 if(ask && (NOAUX.test(qn) || NOAUX2.test(qn))) return false;
 if(ask && QWORD.test(qn) && qn.split(" ").length>=3){
  const mine = lemma(qn);
  const cover = k=>{ const cw = spNorm(px(k)).split(" ").filter(w=>w && !STOPW.has(w)); return cw.length ? cw.filter(w=>mine.includes(lemma(w))).length/cw.length : 0; };
  if((keys||[]).some(k=>cover(k) >= 0.6)) return true;
 }
 /* asking how someone is: "Are you good / fine / well / alright?" asks it too (Marco 2026-09-26) */
 if(ask && (keys||[]).some(k=>/\bhow are you\b|\bare you ok/.test(k)) && /\bare you (good|fine|well|alright|all right|ok|okay|doing well|doing good)\b/.test(qn)) return true;
 if((keys||[]).some(k=>/^\d{2,}$/.test(k) && n.split(" ").some(w=>/^\d{7,}$/.test(w) && w.startsWith(k)))) return true;
 return (keys||[]).some(k=>{
  // the learner's own name is spelled freely by recognisers: match the words around it
  const nk = spNorm(px(k));
  const frags = (name ? (" "+nk+" ").split(" "+name+" ") : [nk]).map(x=>x.trim()).filter(Boolean);
  return frags.length>0 && frags.every(f=>hay.includes(" "+f+" ") || (!OWN_EXACT && lemma(n).includes(lemma(f))));
 });
}

/* ---- the mic on 跟着说 / 自己说说看 ----
   With recognition (shared/speech.js): tap, speak, see what came through. Never blocks:
   Continue opens on a pass or after two tries, and 「现在不方便说」 moves on at once.
   Without it — or when it fails on this device (no permission, no network) — the old
   record-and-play-back, and without a microphone a plain "say it aloud". */
let SPEECH_OFF = false, MIC_OK = false;
const MIC_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
/* What the mic does, said before and after (Marco 2026-09-25 on his iPhone: 「我不知道开麦克风
   最后会出现什么…要它出现了，我才知道你要我做什么」): three numbered steps under the mic,
   and after listening a result card — what it heard, a clear verdict, try again / hear it. */
function SPK_TXT(){
 return ({
  zh:{recMe:"录下来听听自己", mine:"听我自己", s1:"先听示范（上面的喇叭）", s2:"按麦克风，看到「正在听」再说", s3:"说完再按一下，结果会出现在这里", you:"我听到你说：", none:"我没有听到声音。", noneTip:"等画面出现「正在听」再开口，嘴巴离手机近一点。", again:"再说一次", hear:"听示范", ok:"说得很清楚！", red:"红色的字没听清楚，再说一次。"},
  ms:{recMe:"Rakam & dengar diri sendiri", mine:"Dengar suara saya", s1:"Dengar contoh dahulu (pembesar suara di atas)", s2:"Tekan mikrofon, tunggu “Sedang mendengar”, kemudian bercakap", s3:"Selesai? Tekan sekali lagi — keputusan muncul di sini", you:"Saya dengar:", none:"Saya tidak dengar suara anda.", noneTip:"Tunggu “Sedang mendengar” dahulu, dan dekatkan telefon.", again:"Cuba lagi", hear:"Dengar contoh", ok:"Sangat jelas!", red:"Perkataan merah tidak jelas — sebut sekali lagi."},
  en:{recMe:"Record and hear myself", mine:"Hear myself", s1:"Listen to the model first (the speaker above)", s2:"Tap the mic, wait for “Listening”, then speak", s3:"Tap again when you finish — the result appears here", you:"I heard:", none:"I didn't hear anything.", noneTip:"Wait for “Listening” before you speak, and hold the phone closer.", again:"Say it again", hear:"Hear the model", ok:"Very clear!", red:"The red words didn't come through — say it again."}
 })[S.lang] || {s1:"",s2:"",s3:"",you:"",none:"",noneTip:"",again:"",hear:"",ok:"",red:""};
}
function mountSpeech(host, o){
 const t = T(), go = $("go");
 const allow = ()=>{ if(go) go.disabled = false; };
 const first = ()=>{ if(!o.st.tried){ o.st.tried = true; if(o.onFirst) o.onFirst(); } };
 const fallback = note=>{
  allow();
  /* no recognition here: the heading must not keep saying "tap the mic" over Record / Play */
  { const q = document.querySelector("#stepbox .qsub"); if(q && CANREC) q.textContent = ({zh:"先听示范，再按「录音」说一遍，然后播放听听自己。", ms:"Dengar contoh, tekan Rakam dan sebut, kemudian main semula.", en:"Listen first, tap Record and say it, then play yourself back."})[S.lang] || q.textContent; }
  if(CANREC){
   host.innerHTML = (note ? `<div class="spmsg">${esc(note)}</div>` : "") + `<div id="recbox" style="margin-top:14px"></div>`;
   mountRecorder($("recbox"), o.key, first);
  } else host.innerHTML = `<div class="spmsg" style="margin-top:16px">${esc(note ? note+" " : "")}${esc(t.sayAloud)}</div>`;
 };
 if(SPEECH_OFF || !(window.TouchSpeech && TouchSpeech.available)) return fallback("");
 // asked here, not in the tap: anything awaited inside the tap loses it, and iPhone needs the tap to start listening
 try{ if(!MIC_OK && navigator.permissions && navigator.permissions.query) navigator.permissions.query({name:"microphone"}).then(p=>{ MIC_OK = p.state==="granted"; }, ()=>{}); }catch(e){}
 let tries = 0, busy = false;
 const HT = ({zh:{start:"可以用这样的开头：", full:"可以这样说：", std:"标准说法：", legend:"绿色＝你说对的；空格＝还少了的字。", missed:"橙底＝你少了的字。点句子可以听。", bulb:"提示"},
  ms:{start:"Boleh mula begini:", full:"Boleh sebut begini:", std:"Ayat standard:", legend:"Hijau = betul; ruang kosong = perkataan yang tertinggal.", missed:"Latar oren = perkataan yang tertinggal. Tekan ayat untuk dengar.", bulb:"Petunjuk"},
  en:{start:"You could start with:", full:"You can say:", std:"The model sentence:", legend:"Green = you said it; a gap = a word still missing.", missed:"Orange = the words you left out. Tap the sentence to hear it.", bulb:"Hint"}})[S.lang];
 const hints = (o.hints || []).filter(Boolean);
 host.innerHTML = `<div class="microw"><button class="micbig" id="mic" type="button" aria-label="${esc(t.micTap)}">${MIC_SVG}</button>${hints.length ? `<button class="hintbulb" id="bulb" type="button" aria-label="${esc(HT.bulb)}">💡</button>` : ""}</div>
  <div class="spmsg" id="spmsg">${esc(t.micTap)}</div>
  <div class="hintbox hidden" id="sphint"></div>
  <div class="spheard" id="spheard"></div>
  <div class="spres hidden" id="spres"></div>
  <ol class="spsteps" id="spsteps"><li>${esc(o.s1 || SPK_TXT().s1)}</li><li>${esc(SPK_TXT().s2)}</li><li>${esc(SPK_TXT().s3)}</li></ol>
  <button class="linkbtn" id="later" type="button">${esc(t.spLater)}</button>`;
 /* 💡 (Marco 2026-09-26): one tap, a start; a second, the whole sentence — no need to skip
    to see how it is said */
 if(hints.length){ let hn = 0; $("bulb").onclick = ()=>{ hn = Math.min(hn+1, hints.length); const h = hints[hn-1], box2 = $("sphint");
  $("bulb").classList.add("on"); box2.classList.remove("hidden");
  box2.innerHTML = `${esc(hn===hints.length && hints.length>1 ? HT.full : HT.start)} <b${hn===hints.length && /[A-Za-z]/.test(h) ? ` data-say="${esc(sayable(h))}" role="button"` : ""}>${esc(px(h))}</b>`; }; }
 /* what was said against the sentence it should be (Marco 2026-09-26): the right words
    green and the missing ones a gap on the first miss, the whole sentence with the missed
    words marked from the second, and the model beside a pass that was not word for word */
 const cmp = heard=>{
  if(!o.targets || !window.TouchSpeech) return null;
  /* always against the lesson's own sentence (the first), so the gaps on the first miss
     and the answer on the second are the same sentence; `pass` says whether ANY right form
     was met (the alternatives still count as right) */
  const tg = o.targets.filter(Boolean)[0], c = TouchSpeech.check(tg, heard);
  c.target = tg; c.pass = o.targets.filter(Boolean).some(x=>TouchSpeech.check(x, heard).pass);
  return c;
 };
 const struck = (h, c)=>{ const inT = new Set();
  /* "I am" is in "I'm": a contraction's parts count as in the sentence */
  const EXP = {"m":"am","re":"are","s":"is","ll":"will","ve":"have","d":"would"};
  TouchSpeech.tokens(c.target).forEach(w=>{ inT.add(w); const m = /^(.+?)'(m|re|s|ll|ve|d)$/.exec(w), n = /^(.+)n't$/.exec(w);
   if(m){ inT.add(m[1]); inT.add(EXP[m[2]]); if(m[2]==="s") inT.add("has"); if(m[2]==="d") inT.add("had"); }
   if(n){ inT.add("not"); inT.add(n[1]==="won" ? "will" : n[1]==="ca" ? "can" : n[1]); } });
  return String(h).split(/\s+/).map(w=>{ const n = TouchSpeech.tokens(w)[0]; return n && !inT.has(n) ? `<span class="cx">${esc(w)}</span>` : esc(w); }).join(" "); };
 const gaps = c=>c.words.map(x=>x.ok ? `<span class="chit">${esc(x.w)}</span>` : `<span class="cgap"></span>`).join(" ");
 const full = c=>`<b class="cfull" data-say="${esc(sayable(c.target))}" role="button">${c.words.map(x=>x.ok ? esc(x.w) : `<span class="cmiss">${esc(x.w)}</span>`).join(" ")}</b>`;
 const msg = (s, cls)=>{ const m = $("spmsg"); if(m){ m.textContent = s; m.className = "spmsg"+(cls?" "+cls:""); } };
 /* Skipping still shows how it is said, when the step has one sentence to say (student test
    2026-09-25: the spoken translation moved on with no answer at all); the lesson's end
    says how many speaking steps were skipped. */
 $("later").onclick = ()=>{
  if(o.reveal && !$("laterans")){
   host.insertAdjacentHTML("beforeend", `<div class="spres" id="laterans"><div class="spb">${esc(T().stransAns)} <b data-say="${esc(o.reveal)}" role="button">${esc(px(o.reveal))}</b></div></div>`);
   $("later").remove(); allow(); if(P) P.skipped = (P.skipped||0)+1; return;
  }
  if(P) P.skipped = (P.skipped||0)+1; allow(); if(go) go.click();
 };
 $("mic").onclick = async ()=>{
  /* A second tap while listening stops it now and keeps what was heard (Marco 2026-09-25 on
     his iPhone: 「关麦…一直关不到」). "Speak now" shows only once the phone is really taking
     sound, and the words appear as they are heard (「开麦好像录不到我的声音」). */
  if(busy){ TouchSpeech.finish(); return; }
  busy = true;
  try{ if(window.TouchVoice) TouchVoice.stop(); }catch(e){}
  const W = ({zh:{wait:"准备中…", stop:"说完再按一下麦克风"}, ms:{wait:"Bersedia…", stop:"Tekan mikrofon sekali lagi bila selesai"}, en:{wait:"Getting ready…", stop:"Tap the mic again when you finish"}})[S.lang] || {wait:"…", stop:""};
  const mic = $("mic"), hd = $("spheard");
  mic.classList.add("on", "wait"); msg(W.wait, ""); if(hd) hd.textContent = "";
  { const old = $("spres"); if(old){ old.className = "spres hidden"; old.innerHTML = ""; } }   // the last try's card goes
  if(COACH) COACH.pose("listen");
  let heard = [], err = "", started = false, mine = null;
  const trail = [];   // what the phone did, in order — shown small under the result (diagnosis)
  const recTried = TouchSpeech.canRecord && TouchSpeech.canRecord();
  // their own voice, to hear back: a button in the result card as soon as the recording is ready
  const addMine = ()=>{
   const row = document.querySelector("#spres .spbtns");
   if(!mine || !row || $("spmine")) return;
   row.insertAdjacentHTML("afterbegin", `<button type="button" class="btn btn-ghost" id="spmine">▶ ${esc(SPK_TXT().mine)}</button>`);
   $("spmine").onclick = ()=>{ try{ if(window.TouchVoice) TouchVoice.stop(); }catch(e){} playBlob(mine, why=>{ const c = document.querySelector("#spres .spcode"); if(c) c.textContent += " · ▶✗ "+why; }); };
  };
  /* The phone sometimes never starts listening (seen on iPhone, second sentence of a
     lesson): after 4 s without a start, stop and say so, rather than wait silently. */
  /* …but not while the phone is still asking for permission (the first time ever, two
     dialogs: speech recognition and the microphone) — then it waits much longer. */
  const watchdog = setTimeout(()=>{ if(!started){ err = err || "no-start"; TouchSpeech.stop(); } }, MIC_OK ? 4000 : 20000);
  try{
   heard = await TouchSpeech.listen({maxMs: o.long ? 60000 : 9000, long: !!o.long, record: true, log: x=>trail.push(x), onRecorded: b=>{ mine = b; addMine(); },
    onStart: ()=>{ started = true; MIC_OK = true; mic.classList.remove("wait"); msg(t.listening+" · "+W.stop, "live"); },
    onHear: txt=>{ if(hd) hd.textContent = "“"+txt+"”"; }});
  }catch(e){ err = err || String((e && e.message) || e || "error"); }
  clearTimeout(watchdog);
  mic.classList.remove("wait");
  busy = false;
  if(!host.isConnected) return;                                    // moved on while it listened
  mic.classList.remove("on");
  /* Only a refusal ("not-allowed": no permission; "service-not-allowed": no recogniser)
     switches to record-and-play-back for good. Anything else — aborted, no-speech,
     network, a recogniser that never started — ends in the result card below with its
     code in small grey text, so a learner (and we) can see what happened. */
  if(err==="not-allowed" || err==="service-not-allowed"){ SPEECH_OFF = true; return fallback(t.spFallback); }
  if(err==="no-speech") err = "";
  // a phone that cannot record and recognise at once: recognise only, from now on
  if(recTried && (err==="audio-capture" || err==="no-start") && TouchSpeech.noRecording) TouchSpeech.noRecording();
  tries++;
  first();
  if(o.onTries) o.onTries(tries);
  const X = SPK_TXT(), res = $("spres"), steps = $("spsteps");
  if(steps) steps.classList.add("hidden");
  if(hd) hd.textContent = "";
  const card = (cls, head, body)=>{
   if(!res) return;
   res.className = "spres "+cls;
   res.innerHTML = `<div class="sph">${head}</div>${body}<div class="spcode${/[?&]debug\b/.test(location.search)?"":" hidden"}">${esc(trail.join(" · "))}</div><div class="spbtns"><button type="button" class="btn btn-ghost" id="spagain">🎤 ${esc(X.again)}</button>${o.model ? `<button type="button" class="btn btn-ghost" id="sphear">🔊 ${esc(o.hearLabel || X.hear)}</button>` : ""}</div>`;
   $("spagain").onclick = ()=>$("mic").click();
   addMine();
   /* where the phone cannot record while it recognises (iPhone), hearing yourself is a
      separate recording: the record-and-play used before speech recognition came in */
   if(!recTried && CANREC && !$("sprec")){
    res.querySelector(".spbtns").insertAdjacentHTML("afterbegin", `<button type="button" class="btn btn-ghost" id="sprec">🎙 ${esc(SPK_TXT().recMe)}</button>`);
    $("sprec").onclick = ()=>{
     try{ if(window.TouchVoice) TouchVoice.stop(); }catch(e){}
     const box2 = document.createElement("div"); box2.className = "sprecbox";
     res.appendChild(box2); $("sprec").remove();
     mountRecorder(box2, o.key+"-me", ()=>{});
    };
   }
   if(o.model && $("sphear")) $("sphear").onclick = ()=>o.model();
  };
  const more = tries>=2 ? " "+t.spMoveOn : "";
  msg(t.micTap, "");
  if(!heard || !heard.length){
   card("no", "🤔 "+esc(X.none), `<div class="spb">${esc(X.noneTip)}${esc(more)}</div>`);
   if(tries>=2) allow(); if(COACH) COACH.pose("think"); return;
  }
  const C = cmp(heard);
  const said = `<div class="spb">${esc(X.you)} <b>“${C && !C.pass ? struck(heard[0], C) : esc(heard[0])}”</b></div>`;
  const tip = o.tips ? slipTip(heard) : "";
  const passed = o.judge(heard);
  const pm = o.passModel ? o.passModel() : "";
  const modelNote = pm ? `<div class="spb">${esc(T().compareModel)} <b data-say="${esc(pm)}" role="button">${esc(pm)}</b></div>` : "";
  const tipHTML = tip ? `<div class="spb">💡 ${esc(fmt(T().slipTip, {t: tip}))}</div>` : "";
  if(passed){
   const near = (!pm && C && C.words.some(x=>!x.ok)) ? `<div class="spb">${esc(HT.std)} ${full(C)}</div>` : "";
   const partial = o.st && o.st.partial;
   card("ok", "✓ "+esc(partial ? ({zh:"大致对了——注意标红的字", ms:"Hampir tepat — perhatikan perkataan merah", en:"Nearly — mind the red words"})[S.lang] : (o.good || X.ok)), said+tipHTML+modelNote+near);
   allow(); if(COACH) COACH.pose("celebrate");
  } else {
   const reveal = C ? (tries>=2 ? `<div class="spb">${esc(T().stransAns)} ${full(C)}</div><div class="spb csmall">${esc(HT.missed)}</div>`
                               : `<div class="spb cgaps">${gaps(C)}</div><div class="spb csmall">${esc(HT.legend)}</div>`)
    : (o.reveal && tries>=2) ? `<div class="spb">${esc(T().stransAns)} <b data-say="${esc(o.reveal)}" role="button">${esc(o.reveal)}</b></div>` : "";
   const retry = typeof o.retry==="function" ? o.retry(heard) : o.retry;
   const tipNo = (tip && !String(retry||"").includes(tip)) ? tipHTML : "";
   card("no", "✗ "+esc(retry || X.red), said+tipNo+reveal+(more ? `<div class="spb">${esc(more)}</div>` : ""));
   if(tries>=2) allow(); if(COACH) COACH.pose("think");
  }
 };
}

/* ---- record-and-play-back (the old Speak Up step, unchanged in behaviour) ---- */
function mountRecorder(host, key, onRecorded){
 const t = T();
 host.innerHTML = `<div class="recstatus" id="recstatus"></div>
  <div class="recrow">
   <button class="btn btn-rec" id="recbtn">● ${t.record}</button>
   <button class="btn btn-rec on hidden" id="stoprec">■ ${t.stopBtn}</button>
   <button class="btn btn-primary" id="playrec" disabled>▶ ${t.play}</button>
  </div>
  <div class="speaknote" id="speaknote">${esc(t.speakWaitHint)}</div>`;
 let blob = null, awarded = false, chunks = [], phase = "idle";
 const stat = $("recstatus");
 function uiIdle(){
  phase = "idle";
  $("recbtn").classList.remove("hidden");
  $("stoprec").classList.add("hidden");
  $("stoprec").disabled = false;
  $("playrec").disabled = !blob;
  $("recbtn").innerHTML = blob ? "↻ "+t.tryAgain : "● "+t.record;
  stat.textContent = "";
  stat.classList.remove("go");
 }
 // restore a recording from a previous session (IndexedDB)
 recLoad(key).then(b=>{ if(b && !blob && phase==="idle" && host.isConnected){ blob = b; uiIdle(); $("speaknote").textContent = t.speakSavedHint; } });
 $("recbtn").onclick = async ()=>{
  if(phase!=="idle") return;
  phase = "prep";
  try{
   chunks = [];
   REC.stream = await navigator.mediaDevices.getUserMedia({audio:true});
  }catch(e){
   phase = "idle";
   $("speaknote").textContent = t.speakDenied;
   return;
  }
  $("recbtn").classList.add("hidden");
  $("stoprec").classList.add("hidden");
  stat.classList.remove("go");
  // No 3·2·1 any more (2026-09-24): the mic light was on while nothing was recorded,
  // so learners spoke into the countdown and lost it. The recorder starts as soon as the mic opens.
  phase = "count";
  stat.textContent = t.getReady;
  // ---- start the recorder EARLY, before "Speak now" (head buffer) ----
  try{
   REC.recorder = new MediaRecorder(REC.stream);
   REC.recorder.ondataavailable = e=>{ if(e.data) chunks.push(e.data); };
   REC.recorder.onstop = ()=>{
    const got = new Blob(chunks, {type: REC.recorder.mimeType || "audio/webm"});
    const track = (REC.stream && REC.stream.getAudioTracks()[0]) || null;
    try{ REC.stream.getTracks().forEach(tr=>tr.stop()); }catch(e){}
    /* An empty recording (the phone gave the page a microphone that was already closed —
       seen when it is still held by speech recognition) must say so, not claim "saved"
       and then play silence. */
    if(!got.size){
     $("speaknote").textContent = (({zh:"没有录到声音，请再录一次。", ms:"Tiada suara dirakam — sila rakam semula.", en:"Nothing was recorded — please record again."})[S.lang] || "")+" (0 bytes"+(track ? ", mic "+track.readyState : "")+")";
     uiIdle(); return;
    }
    blob = got;
    recSave(key, blob);
    if(!awarded){ awarded = true; if(onRecorded) onRecorded(); }
    $("speaknote").textContent = t.speakSaved;
    uiIdle();
   };
   REC.recorder.start();
  }catch(e){ $("speaknote").textContent = t.speakDenied; uiIdle(); return; }
  phase = "buffer";
  recTimer(()=>{
   phase = "speaking";
   stat.classList.add("go");
   stat.textContent = "🟢 "+t.speakNow;
   $("stoprec").classList.remove("hidden");
  }, HEAD_BUF);
 };
 $("stoprec").onclick = ()=>{
  if(phase!=="speaking") return;
  phase = "saving";
  $("stoprec").disabled = true;
  stat.classList.remove("go");
  stat.textContent = t.saving;
  // ---- tail buffer: keep capturing a little after Stop so the last word survives ----
  recTimer(()=>{ try{ if(REC.recorder && REC.recorder.state==="recording") REC.recorder.stop(); }catch(e){ uiIdle(); } }, TAIL_BUF);
 };
 $("playrec").onclick = ()=>{ if(blob && phase==="idle") playBlob(blob, why=>{ $("speaknote").textContent = "▶ ✗ ("+why+")"; }); };
 uiIdle();
}

function renderStep(){
 hideFeedback();
 killRec();
 setProg();
 const t = T();
 const st = P.steps[P.idx];
 const l = COURSE[P.mi].lessons[P.li];
 const box = $("stepbox");
 const stepNum = P.idx < baseLen() ? `${t.step} ${P.idx+1}/${baseLen()}` : `${t.redoTag} ${P.idx+1-baseLen()}/${P.steps.length-baseLen()}`;
 P.last = null;
 STEP_TAG = st.redo ? `<span class="steptag redo">↻ ${esc(t.redoTag)}</span>`
  : (st.rv && st.ref) ? `<span class="steptag">${esc(reviewTagText(st.ref))}</span>` : "";
 // Simple English learners get a simple English meaning when the word has one (w[4]; student test 2026-09-25)
 const gl = w=> S.lang==="ms" ? w[2] : (S.lang==="zh" ? w[1] : (w[4] || w[1]+" · "+w[2]));
 const still = ()=> P && P.steps[P.idx]===st;          // for delayed audio: still on this screen?

 /* Sound off: a step that can only be answered by ear is not asked (student test 2026-09-25:
    Priya, in a quiet office, had to guess and was marked wrong for what she never heard). */
 if(["gist","listenonly","convo","ls"].includes(st.kind) && !S.sound){
  box.innerHTML = stepShell(stepNum, esc(st.kind==="gist" ? t.gistK : st.kind==="convo" ? t.convoK : st.kind==="ls" ? t.lsK : t.loK), "",
   `<div class="scenebox">🔇 ${esc(t.listenMuted)}</div>`, `<button class="btn btn-primary btn-block" id="go">${t.continue}</button>`);
  $("go").onclick = ()=>{ P.skipped = (P.skipped||0)+1; nextStep(); };
  return;
 }
 /* LEVEL 2 · the conversation heard first: each line is a speaker button, the replies are
    text; match them (practice: +5 XP, not counted). A matched line shows its words. */
 if(st.kind==="convo"){
  const cand = l.cm.pairs.slice(0,4), idxs = cand.map((_,i)=>i);
  const qOrder = shuffle(idxs.slice()), rOrder = shuffle(idxs.slice());
  const WAVE = '<span class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
  const inner = `<div class="pairgrid cmgrid">`+ qOrder.map((qi,row)=>{ const ri = rOrder[row];
    return `<button class="pa cq" data-i="${qi}">${SPK_ON_SVG}${WAVE}<span class="cqt hidden">${esc(px(cand[qi][0]))}</span></button>`+
           `<button class="pw cr" data-i="${ri}">${esc(px(cand[ri][1]))}</button>`; }).join("")+`</div>`;
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.convoK), t.convoSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
  let selQ=null, selR=null, pairs=0;
  const tryPair = ()=>{
   if(selQ===null||selR===null) return;
   const q=box.querySelector(`.cq[data-i="${selQ}"]`), r=box.querySelector(`.cr[data-i="${selR}"]`);
   if(selQ===selR){
    q.classList.remove("sel"); r.classList.remove("sel"); q.classList.add("paired"); r.classList.add("paired");
    q.querySelector(".cqt").classList.remove("hidden");
    // put the reply beside ITS line (the grid is line, reply, line, reply…), so the finished list reads right
    const beside = q.nextElementSibling;
    if(beside && beside!==r){ const ph = document.createElement("span"); r.replaceWith(ph); beside.replaceWith(r); ph.replaceWith(beside); }
    if(++pairs===cand.length){ if(!st.paid){ st.paid = true; P.xp += 5; $("sessxp").textContent = P.xp; xpFloat(5); } $("go").disabled=false; }
   } else { r.classList.add("shake"); setTimeout(()=>r.classList.remove("shake","sel"), 420); q.classList.remove("sel"); }
   selQ=null; selR=null;
  };
  box.querySelectorAll(".cq").forEach(b=>{ b.onclick=()=>{ speak(sayable(cand[+b.dataset.i][0]), b, false, true, lessonVoice(l)); if(b.classList.contains("paired")) return;
   box.querySelectorAll(".cq:not(.paired)").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); selQ=+b.dataset.i; tryPair(); }; });
  box.querySelectorAll(".cr").forEach(b=>{ b.onclick=()=>{ if(b.classList.contains("paired")) return;
   box.querySelectorAll(".cr:not(.paired)").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); selR=+b.dataset.i; tryPair(); }; });
  $("go").onclick = ()=>nextStep();
  return;
 }
 /* LEVEL 2 · heard, then answered (counted; a miss goes to review). Reading the words first
    is allowed but then it counts as reading: XP only. */
 if(st.kind==="ls"){
  const it = st.it, say = sayable(it.say);
  const optTxt = o => typeof o==="string" ? px(o) : px(tri(o));
  const opts = shuffle(it.o.map((o,i)=>({i, v:optTxt(o)})));
  const inner = `<div class="hearbig"><button class="hearplay" id="hp" type="button" aria-label="play">${SPK_ON_SVG}</button>`
   + `<button class="hearslow" id="hps" type="button" aria-label="slow"><span class="tt">🐢</span>${esc(t.hearSlow)}</button></div>
   <div class="scenebox hidden" id="lstext">“${esc(say)}”</div><button type="button" class="linkbtn" id="lsshow">${esc(t.lsShow)}</button>
   <div class="qsub" style="margin:12px 0 8px;font-weight:700">${esc(px(tri(it.q)))}</div>`
   + opts.map(o=>`<button class="opt" data-i="${o.i}"><span class="radio"></span><span>${esc(o.v)}</span></button>`).join("");
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.lsK), t.lsSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.check}</button>`);
  let read = !S.sound;
  if(read) $("lstext").classList.remove("hidden");
  $("hp").onclick = ()=>speak(say, $("hp"), false, true, lessonVoice(l));
  $("hps").onclick = ()=>speak(say, $("hps"), true, true, lessonVoice(l));
  $("lsshow").onclick = ()=>{ read = true; $("lstext").classList.remove("hidden"); $("lsshow").remove(); };
  setTimeout(()=>{ if(still()) speak(say, $("hp"), false, true, lessonVoice(l)); }, 350);
  let sel = null;
  box.querySelectorAll(".opt").forEach(b=>{ b.onclick=()=>{ box.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); sel = b; $("go").disabled = false; }; });
  $("go").onclick = ()=>{
   if(!sel) return;
   const ok = +sel.dataset.i===it.a;
   box.querySelectorAll(".opt").forEach(b=>{ b.disabled = true; if(+b.dataset.i===it.a) b.classList.add("right"); else if(b===sel && !ok) b.classList.add("wrong"); });
   $("lstext").classList.remove("hidden"); if($("lsshow")) $("lsshow").remove();
   $("go").disabled = true;
   const correct = optTxt(it.o[it.a]);
   const gained = read ? (ok && !st.paid ? (st.paid = true, P.xp += 5, $("sessxp").textContent = P.xp, 5) : 0) : award(5, ok);
   if(!read) trackAnswer(ok, st.ref||{m:P.mi,l:P.li,k:"ls",n:st.n}, "🎧 "+say+" — "+px(tri(it.q)), correct, it.e ? tri(it.e) : "");
   else P.last = {ref: st.ref||{m:P.mi,l:P.li,k:"ls",n:st.n}, given: optTxt(it.o[+sel.dataset.i]), pooled:false, question: px(tri(it.q))};
   showFeedback(ok, {correct, expl: it.e ? tri(it.e) : "", xp:gained, onContinue:()=>nextStep()});
  };
  return;
 }
 /* LEVEL 2 · 15 seconds to plan before SAY IT YOURSELF (Yuan & Ellis 2003: planning time
    makes what follows more fluent and more complex). Continue opens when the time is up. */
 if(st.kind==="plan"){
  const inner = `<div class="bubble" style="margin:4px 0 12px"><div class="bt">${esc(st.prompt ? tri(st.prompt) : "")}</div></div>${skillCardHTML(l)}
   <div class="qsub" id="planleft" style="text-align:center;margin-top:14px"></div>`;
  const planSub = ({story:t.planStory, ppf:t.planPPF, loop:t.planLoop})[l.skill] || t.planSub;
  box.innerHTML = stepShell(stepNum, esc(t.planK), planSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.planGo}</button>`);
  let left = 15;
  $("go").disabled = false;   // never forced (Hafiz: a wait before speaking he was going to skip)
  const tick = ()=>{ if(!still()) return; const el = $("planleft"); if(!el) return;
   if(left<=0){ el.textContent = ""; return; }
   el.textContent = fmt(t.planWait, {n:left}); left--; setTimeout(tick, 1000); };
  tick();
  $("go").onclick = ()=>nextStep();
  return;
 }
 /* LEVEL 1 BOSS · the build mission: 3–5 connected sentences said in one go, checked for
    one phrase from each required group and a minimum length (not counted; +20 on a pass
    or after two tries). The example is hidden until asked for: build first, compare later. */
 if(st.kind==="mission"){
  const M = ex0().mission;
  const inner = `<div class="bubble" style="margin:4px 0 12px"><div class="bt">${esc(tri(M.prompt))}</div></div>
   <div class="qsub" style="margin-bottom:8px">${esc(fmt(t.missionNeed, {n:M.minWords}))}</div>
   <button type="button" class="btn btn-ghost btn-block" id="mmodel">${esc(t.missionModel)}</button>
   <div class="scenebox hidden" id="mmtext" style="text-align:left;line-height:1.7">${M.model.map(x=>`<span data-say="${esc(sayable(x))}" role="button">${esc(px(x))}</span>`).join("<br>")}</div>
   <div id="sparea"></div>`;
  box.innerHTML = stepShell("🎤 "+stepNum+" · +20 XP", esc(l.boss ? t.missionK : t.wholeK), t.missionSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
  $("mmodel").onclick = ()=>{ const b = $("mmtext"), open = b.classList.toggle("hidden"); $("mmodel").textContent = open ? t.missionModel : t.missionHide; };
  const pay = ()=>{ if(st.paid) return; st.paid = true; P.xp += 20; $("sessxp").textContent = P.xp; xpFloat(20); };
  $("go").onclick = ()=>{ if(st.tries2) pay(); nextStep(); };
  const missing = heard=>{
   const h = " "+spNorm((heard||[]).join(" "))+" ", n = h.trim() ? h.trim().split(/\s+/).length : 0;
   const said = new Set(h.trim().split(/\s+/));
   const closest = g=>g.slice().sort((a,b)=>spNorm(px(b)).split(" ").filter(w=>said.has(w)).length - spNorm(px(a)).split(" ").filter(w=>said.has(w)).length)[0];
   const cap = x=>{ const v = px(x); return v.charAt(0).toUpperCase()+v.slice(1).replace(/\bi\b/g, "I"); };
   // a group may carry a label in the learner's language (mission.labels[i]); else its closest phrase
   const gaps = M.groups.map((g,i)=>[g,i]).filter(([g])=>!g.some(k=>lemmaHit(h, k))).map(([g,i])=>M.labels && M.labels[i] ? tri(M.labels[i])+" ("+cap(closest(g))+"…)" : cap(closest(g)));
   // the judge's own verdict: a short answer about the task is short, not off-topic (Hafiz, round 3)
   const offT = st.offTopic;
   if(st.notHit) return notMsg(st.notHit, heard);
   if(offT) return t.missionOff;
   return (gaps.length ? fmt(t.missionGaps, {g: gaps.join(" · ")})+" " : "") + (n < M.minWords ? fmt(t.missionShort, {n, m:M.minWords}) : "");
  };
  mountSpeech($("sparea"), {st, tips: true, key: COURSE[P.mi].id+"-"+P.li+"-mission", long: true, good: t.missionGood,
   s1: t.missionS1, retry: heard=>missing(heard) || t.missionRetry,
   onTries: n=>{ if(n>=2) st.tries2 = true; },
   judge: heard=>{
    const h = " "+spNorm((heard||[]).join(" "))+" ";
    const ws = h.trim().split(/\s+/), distinct = new Set(ws).size;
    /* "I need could you before because report report…" hit every group: enough DIFFERENT
       words are needed too (student test 2026-09-25) */
    // the task's own words — not the formula's (think, because, example, understand…), which every answer has
    const formulaW = new Set(M.groups.flat().flatMap(k=>spNorm(px(k)).split(" ")).map(w=>lemma(w).trim()));
    const modelW = new Set(spNorm(px(M.model.join(" "))).split(" ").filter(w=>w.length>3 && !STOPW.has(w)).map(w=>lemma(w).trim()).filter(w=>!formulaW.has(w)));
    /* "introduce yourself" must pass with the learner's own life (walkthrough 2026-09-26: only the
       model's Ipoh / Siti passed) — the task's own words count, and two are enough */
    spNorm([M.prompt && M.prompt.en, M.prompt && tri(M.prompt)].filter(Boolean).join(" ")).split(" ").filter(w=>w.length>3 && !STOPW.has(w)).map(w=>lemma(w).trim()).filter(w=>!formulaW.has(w)).forEach(w=>modelW.add(w));
    /* the English prompt's own subject words count even when a group uses them — "hometown",
       "colleague", "name" ARE the topic of an introduction (a full, true intro with his own town
       and colleague was called off-topic); the quoted formula ('because', 'I think') is not */
    if(M.prompt && M.prompt.en) spNorm(M.prompt.en.replace(/'[^']*'|"[^"]*"|“[^”]*”|‘[^’]*’/g, " ")).split(" ").filter(w=>w.length>3 && !STOPW.has(w) && !MISSION_HOW.has(w)).map(w=>lemma(w).trim()).forEach(w=>modelW.add(w));
    /* a part of the task said in its own words is on topic too ("my name is", "this is my colleague",
       "she works") — but not a linking formula (because, I think, for example), which fits any subject */
    const partsSaid = M.groups.filter(g=>g.some(k=>lemmaHit(h, k) && spNorm(px(k)).split(" ").some(w=>w.length>3 && !STOPW.has(w) && !MISSION_HOW.has(w)))).length;
    const onTopic = [...new Set(ws.filter(w=>w.length>3).map(w=>lemma(w).trim()))].filter(w=>modelW.has(w)).length + (partsSaid >= 2 ? partsSaid : 0);   // one topic word alone proves little
    /* "I think because for example I understand let us. My cat is orange…" hit every group (Hafiz):
       it must also be about the task — at least three of the model answer's content words */
    const small = ws.filter(w=>STOPW.has(w)).length / Math.max(1, ws.length);
    // under the minimum it is short, and the gaps say what to add (Hafiz, round 3: his own name and town are not the model's words)
    st.offTopic = ws.length >= M.minWords && (onTopic < 3 || small < 0.25);
    st.notHit = lessonNots().find(k=>h.includes(" "+k+" ")) || "";
    const ok = !st.notHit && !st.offTopic && M.groups.every(g=>g.some(k=>lemmaHit(h, k))) && ws.length >= M.minWords && distinct >= Math.min(ws.length, M.minWords) * 0.6;
    if(ok) pay();
    return ok;
   }});
  return;
 }
 /* LEVEL 1 · the dialogue heard first, no text, one gist question (not counted, +5 when right) */
 if(st.kind==="gist"){
  const g = ex0().gist, lines = (l.d && l.d.lines) || [];
  if(!st.order) st.order = shuffle(g.o.map((_,i)=>i));
  const say = lines.map(x=>({v: x.who==="Y" ? "" : voiceOf(x.who), s: sayable(x.who==="Y" ? x.ans : x.en)})).filter(x=>x.s);
  const inner = `<div class="hearbig"><button type="button" class="btn btn-ghost btn-block" id="gplay">${esc(t.gistPlay)}</button></div>
   <div class="qsub" style="margin:14px 0 8px;font-weight:700">${esc(tri(g.q))}</div>`
   + st.order.map(i=>`<button class="opt" data-i="${i}"><span class="radio"></span><span>${esc(tri(g.o[i]))}</span></button>`).join("");
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.gistK), t.gistSub+" "+t.gistEase, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.check}</button>`);
  let playing = null;
  const stopPlay = ()=>{ playing = null; try{ if(window.TouchVoice) TouchVoice.stop(); }catch(e){} const b = $("gplay"); if(b) b.textContent = t.gistPlay; };
  const play = ()=>{
   if(playing){ stopPlay(); return; }
   if(!window.TouchVoice || !S.sound) return;
   const token = playing = {}; $("gplay").textContent = t.gistStop;
   let i = 0;
   const next = ()=>{ if(playing!==token || !still()) return; if(i>=say.length){ stopPlay(); return; }
    const x = say[i++]; TouchVoice.say(x.s, {fallbackMaxWords:99, voice:x.v, onDone:()=>setTimeout(next, 450)}); };
   next();
  };
  $("gplay").onclick = play;
  setTimeout(()=>{ if(still()) play(); }, 400);
  let sel = null;
  box.querySelectorAll(".opt").forEach(b=>{ b.onclick=()=>{ box.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); sel = b; $("go").disabled = false; }; });
  $("go").onclick = ()=>{
   if(!sel) return;
   stopPlay();
   const ok = +sel.dataset.i===g.a;
   box.querySelectorAll(".opt").forEach(b=>{ b.disabled = true; if(+b.dataset.i===g.a) b.classList.add("right"); else if(b===sel && !ok) b.classList.add("wrong"); });
   $("go").disabled = true;
   P.last = {ref:{m:P.mi, l:P.li, k:"gist", n:0}, given:tri(g.o[+sel.dataset.i]), pooled:false, question:tri(g.q)};
   let gained = 0; if(ok && !st.paid){ st.paid = true; P.xp += 5; gained = 5; $("sessxp").textContent = P.xp; }
   showFeedback(ok, {correct:tri(g.o[g.a]), xp:gained, onContinue:()=>nextStep()});
  };
  return;
 }
 /* LEVEL 1 · one sentence heard with no text, a question about it (not counted, +5 when right) */
 if(st.kind==="listenonly"){
  const it = st.it, opts = it.o.map(o=>typeof o==="string" ? o : tri(o));
  if(!st.order) st.order = shuffle(opts.map((_,i)=>i));
  const inner = `<div class="hearbig"><button class="hearplay" id="hp" type="button" aria-label="play">${SPK_ON_SVG}</button>`
   + `<button class="hearslow" id="hps" type="button" aria-label="slow"><span class="tt">🐢</span>${esc(t.hearSlow)}</button></div>
   <div class="qsub" style="margin:14px 0 8px;font-weight:700">${esc(tri(it.q))}</div>`
   + st.order.map(i=>`<button class="opt" data-i="${i}"><span class="radio"></span><span>${esc(opts[i])}</span></button>`).join("");
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.loK), t.loSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.check}</button>`);
  $("hp").onclick = ()=>speak(it.say, $("hp"), false, true, lessonVoice(l));
  $("hps").onclick = ()=>speak(it.say, $("hps"), true, true, lessonVoice(l));
  setTimeout(()=>{ if(still()) speak(it.say, $("hp"), false, true, lessonVoice(l)); }, 350);
  let sel = null;
  box.querySelectorAll(".opt").forEach(b=>{ b.onclick=()=>{ box.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); sel = b; $("go").disabled = false; }; });
  $("go").onclick = ()=>{
   if(!sel) return;
   const ok = +sel.dataset.i===it.a;
   box.querySelectorAll(".opt").forEach(b=>{ b.disabled = true; if(+b.dataset.i===it.a) b.classList.add("right"); else if(b===sel && !ok) b.classList.add("wrong"); });
   $("go").disabled = true;
   P.last = {ref:{m:P.mi, l:P.li, k:"listenonly", n:st.n}, given:opts[+sel.dataset.i], pooled:false, question:tri(it.q)+" (🔊 "+it.say+")"};
   let gained = 0; if(ok && !st.paid){ st.paid = true; P.xp += 5; gained = 5; $("sessxp").textContent = P.xp; }
   showFeedback(ok, {correct:opts[it.a], expl:t.loWas+" "+it.say, xp:gained, onContinue:()=>nextStep()});
  };
  return;
 }
 /* LEVEL 1 · a translation SAID aloud (not counted; +10 on a pass or after two tries) */
 if(st.kind==="strans"){
  const it = st.it;
  const ans = sayable(it.ans), alts = (it.alt||[]).map(sayable);
  const l2 = typeof CONF!=="undefined" && CONF.flow==="l2" && it.src && it.src.en && S.lang!=="en";
  const inner = (l2 ? mascotBubble(esc(px(it.src.en))+`<div class="cuezh hidden" id="cuezh">${esc(px(tri(it.src)))}</div>`)+`<button type="button" class="linkbtn" id="cuebtn">${esc(t.cueZh)}</button>`
   : mascotBubble(esc(px(tri(it.src))))) + `<div id="sparea"></div>`;
  box.innerHTML = stepShell("🎤 "+stepNum+" · +10 XP", esc(t.stransK), l2 ? t.stransSubL2 : t.stransSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
  if($("cuebtn")) $("cuebtn").onclick = ()=>{ $("cuezh").classList.remove("hidden"); $("cuebtn").remove(); };
  const pay = ()=>{ if(st.paid) return; st.paid = true; P.xp += 10; $("sessxp").textContent = P.xp; xpFloat(10); };
  $("go").onclick = ()=>{ if(st.tries2) pay(); nextStep(); };
  mountSpeech($("sparea"), {st, tips: CONF.flow==="l2", passModel: ()=>st.byIdea ? ans : "", key: COURSE[P.mi].id+"-"+P.li+"-st"+st.n, reveal: ans,
   targets: CONF.flow==="l2" ? null : [ans].concat(alts), hints: [String(ans).split(/\s+/).slice(0,3).join(" ").replace(/[,.!?;:]+$/,"")+"…", ans], retry: ()=>whyText(st.why, true),
   s1: ({zh:"先想一想英文怎么说", ms:"Fikir dahulu bagaimana menyebutnya", en:"First think how to say it in English"})[S.lang],
   onTries: n=>{ if(n>=2) st.tries2 = true; },
   judge: heard=>{
    const cs = [ans].concat(alts).map(target=>TouchSpeech.check(target, heard));
    const exact = cs.some(c=>c.pass);
    let ok = exact || (CONF.flow==="l2" && ideaCheck([ans].concat(alts), heard));
    st.byIdea = ok && !exact;
    st.why = ok ? "" : (cs.slice().sort((a,b)=>b.ok/b.total - a.ok/a.total)[0].why || "");
    { const bad = hardSlip(heard) || decoyHit(heard, it, [ans].concat(alts)) || (ok ? meaningGuard(ans, heard) : ""); if(bad){ ok = false; st.byIdea = false; st.why = bad; } }
    if(ok && it.must && it.must.length && !heard.some(h=>it.must.some(k=>lemmaHit(" "+spNorm(h)+" ", k)))){ ok = false; st.byIdea = false; st.why = "not:"+fmt(t.ownMust, {w: it.must.slice(0,2).join(" / ")}).replace(/[。.]?\s*$/,""); }
    if(!ok && CONF.flow!=="l2") ideaCheck.slip = "";
    if(ok){ pay(); speak(ans); }
    return ok;
   }});
  return;
 }
 if(st.kind==="goal"){
  const ex = lessonExtra(P.mi, P.li);
  const goalTxt = (ex && ex.goal) ? tri(ex.goal) : tri(l.t);
  const says = (ex && ex.goalSay && ex.goalSay.length) ? ex.goalSay.slice(0,2) : (l.p[0] ? [l.p[0].t] : []);
  const rows = says.map(s=>{
   const heard = fillBlank(l, s) || blankPause(s);
   return `<button class="saybtn" type="button" data-sayit="${esc(heard)}">${SPK_SVG}<span>${esc(px(s)).replace(/___/g,"<b>___</b>")}</span></button>`;
  }).join("");
  box.innerHTML = `<div class="stepcard goalcard">
   <div class="goalcoach"><span class="coachslot" data-coach></span></div>
   ${STEP_TAG}<div class="goalk">${esc(t.goalK)}</div>
   <div class="goalline">${esc(goalTxt)}</div>
   ${rows}
   ${skillCardHTML(l)}
   <div class="goaltime">${esc(t.goalTime.replace(/\d+/, String(Math.max(5, Math.round(P.steps.length*40/60)))))}</div>
   <div class="pfoot"><button class="btn btn-primary btn-block" id="go">${esc(t.goalGo)}</button></div>
  </div>`;
  box.querySelectorAll(".saybtn").forEach(b=>{ b.onclick=()=>speak(b.dataset.sayit, b); });
  $("go").onclick = ()=>nextStep();
  return;
 }
 if(st.kind==="meet"){
  const inner = st.idx.map(i=>{
   const w = l.w[i];
   return `<div class="meetw"><div class="en">${esc(w[0])}</div><div class="gl">${esc(gl(w))}</div>`
    + (w[3] ? `<div class="ex" data-say="${esc(sayable(w[3]))}" role="button" tabindex="0">${esc(px(w[3]))}</div>` : "")
    + (TTS ? `<button class="spk" data-w="${esc(w[0])}" aria-label="play">${SPK_SVG}</button>` : "") + `</div>`;
  }).join("");
  box.innerHTML = stepShell(stepNum+(st.last?" · +5 XP":""), esc(t.meetK), t.meetSub, inner,
   `<button class="btn btn-primary btn-block" id="go">${t.continue}</button>`);
  box.querySelectorAll(".spk").forEach(b=>{ b.onclick=()=>speak(b.dataset.w,b); });
  $("go").onclick = ()=>{ if(st.last) P.xp += 5; nextStep(); };      // the old vocabulary list's +5
  setTimeout(()=>{ const b = box.querySelector(".spk"); if(b && still()) speak(b.dataset.w, b); }, 350);
  return;
 }
 if(st.kind==="hearpick"){
  if(!S.sound){
   box.innerHTML = stepShell(stepNum, esc(t.hearK), "", `<div class="scenebox">🔇 ${esc(t.listenMuted)}</div>`,
    `<button class="btn btn-primary btn-block" id="go">${t.continue}</button>`);
   $("go").onclick = ()=>{ P.skipped = (P.skipped||0)+1; nextStep(); };   // not heard: no XP
   return;
  }
  if(st.target==null){                           // decided once, so a redraw asks the same word
   const cand = st.idx.filter(i=>!/\//.test(l.w[i][0]));
   const from = cand.length ? cand : st.idx;
   st.target = from[Math.floor(Math.random()*from.length)];
   const opts = st.idx.slice();
   const others = shuffle(l.w.map((_,i)=>i).filter(i=>!opts.includes(i)));
   while(opts.length<3 && others.length) opts.push(others.shift());
   st.opts = shuffle(opts);
  }
  const w = l.w[st.target];
  const inner = `<div class="hearbig"><button class="hearplay" id="hp" type="button" aria-label="play">${SPK_ON_SVG}</button>`
   + `<button class="hearslow" id="hps" type="button" aria-label="slow"><span class="tt">🐢</span>${esc(t.hearSlow)}</button></div>`
   + st.opts.map(i=>`<button class="opt" data-i="${i}"><span class="radio"></span><span>${esc(l.w[i][0])}</span></button>`).join("");
  box.innerHTML = stepShell(stepNum+(st.last?" · +5 XP":""), esc(t.hearQ), "", inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.check}</button>`);
  $("hp").onclick = ()=>speak(w[0], $("hp"));
  $("hps").onclick = ()=>speak(w[0], $("hps"), true);
  setTimeout(()=>{ if(still()) speak(w[0], $("hp")); }, 300);
  let sel = null;
  box.querySelectorAll(".opt").forEach(b=>{ b.onclick=()=>{          // no sound on tap: it would give the answer away
   box.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); sel = b; $("go").disabled = false; }; });
  $("go").onclick = ()=>{
   if(!sel) return;
   const ok = +sel.dataset.i===st.target;
   box.querySelectorAll(".opt").forEach(b=>{ b.disabled = true;
    if(+b.dataset.i===st.target) b.classList.add("right"); else if(b===sel && !ok) b.classList.add("wrong"); });
   $("go").disabled = true;
   P.last = {ref:{m:P.mi, l:P.li, k:"hearpick", n:st.target}, given:l.w[+sel.dataset.i][0], pooled:false,
    question: t.hearQ+" (🔊 "+w[0]+") ["+st.opts.map(i=>l.w[i][0]).join(" / ")+"]"};
   let gained = 0;
   if(st.last && ok){ P.xp += 5; gained = 5; $("sessxp").textContent = P.xp; }   // the old listening match's +5, earned
   showFeedback(ok, {correct:w[0], expl:fmt(t.hearIs, {w:w[0], g:gl(w)}), xp: ok ? gained : 0, onContinue:()=>nextStep()});
  };
  return;
 }
 if(st.kind==="repeat"){
  const pat = patternFor(l, st.say);
  const inner = `<div class="repsent" id="repsent">${st.say.split(/\s+/).map(x=>`<span class="w">${esc(x)}</span>`).join(" ")}</div>
   <div class="repmodel"><button type="button" id="hm">${SPK_SVG}${esc(t.hearModel2)}</button><button type="button" id="hms">🐢 ${esc(t.hearSlow)}</button></div>
   <div id="sparea"></div>
   ${pat ? `<div class="pat reppat"><div class="tp">${esc(px(pat.t)).replace(/___/g,"<b>___</b>")}</div><div class="nt">${esc(px(tri(pat.n)))}</div></div>` : ""}`;
  box.innerHTML = stepShell(stepNum+(st.first?" · +5 XP":""), esc(t.repeatK), t.repeatSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
  $("hm").onclick = ()=>speak(st.say, $("hm"));
  $("hms").onclick = ()=>speak(st.say, $("hms"), true);
  setTimeout(()=>{ if(still()) speak(st.say, $("hm")); }, 300);
  $("go").onclick = ()=>{ if(st.first && !st.paid){ st.paid = true; P.xp += 5; } nextStep(); };   // the old patterns step's +5
  mountSpeech($("sparea"), {st, key: COURSE[P.mi].id+"-"+P.li+"-r"+st.n, model: ()=>speak(st.say, $("hm")),
   retry: ()=>whyText(st.why),
   judge: heard=>{
    /* "Can I have this / that?" is two sentences to choose from, not one with a slash
       (walkthrough 2026-09-26: only "can I have this that" passed) */
    const vars = slashVariants(st.say);
    const cs = vars.map(v=>TouchSpeech.check(v, heard)), c = cs.find(x=>x.pass) || cs[0];
    st.why = c.why; st.partial = c.pass && c.words.some(x=>!x.ok);
    if(c.pass){ const bad = hardSlip(heard); if(bad){ st.why = bad; st.partial = false; $("repsent").innerHTML = c.words.map(x=>`<span class="w ${x.ok?"hit":"miss"}">${esc(x.w)}</span>`).join(" "); return false; } }
    $("repsent").innerHTML = c.words.map(x=>`<span class="w ${x.ok?"hit":"miss"}">${esc(x.w)}</span>`).join(" ");
    return c.pass;
   }});
  return;
 }
 if(st.kind==="own"){
  const prompt = st.prompt ? tri(st.prompt) : t.ownFallback;
  const inner = `<div class="ownrow"><span class="coachslot" data-coach></span>
    <div class="bubble"><div class="bt" data-sayit="${esc(st.line)}" role="button" tabindex="0">${esc(st.line)}</div></div></div>
   ${st.hint ? `<div class="ownhint">${esc(t.ownHint)} ${esc(st.hint)}</div>` : ""}
   <div id="sparea"></div>`;
  box.innerHTML = stepShell("🎤 "+t.ownK+" · "+stepNum+" · +5 XP", esc(prompt), "", inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
  const bt = box.querySelector(".bubble .bt");
  bt.onclick = ()=>speak(st.line, null, false, true, voiceOf(st.who));
  setTimeout(()=>{ if(still()) speak(st.line, null, false, true, voiceOf(st.who)); }, 350);
  /* +5 when it is said right, or on moving on after two honest tries — never on the same
     screen as a red ✗ (walkthrough 2026-09-25). 「现在不方便说」 earns nothing. */
  const pay = ()=>{ if(st.paid) return; st.paid = true; P.xp += 5; $("sessxp").textContent = P.xp; xpFloat(5); };
  $("go").onclick = ()=>{ if(st.tried && st.tries2) pay(); nextStep(); };
  /* the first hint is the start of the model sentence — something that can be said as it is
     ("Nice to meet you, Mei Ling…"), not a bare key ("Do not understand…", walkthrough round 2) */
  const k0 = st.model ? px(st.model).split(/\s+/).slice(0, 4).join(" ").replace(/[,.!?;:]+$/,"") + "…"
   : (st.keys || [])[0] ? String(st.keys[0]).replace(/^./, c=>c.toUpperCase()) + "…" : "";
  mountSpeech($("sparea"), {st, tips: true, key: COURSE[P.mi].id+"-"+P.li+"-own", hints: [k0, st.model ? px(st.model) : ""], retry: heard=>{ const hs = (heard||[]).map(h=>spNorm(h)); if(st.needMust) return fmt(t.ownMust, {w: st.must.slice(0,2).join(" / ").replace(/\bi\b/g, "I")});
    if(st.hitNot) return notMsg(st.hitNot, heard); if(st.tooShort) return t.ownShort;
    if(st.slip) return whyText(st.slip);
    if(st.wrongWho) return fmt(({zh:"你是在直接问 {who}，要用 you，不是 he / she。", ms:"Anda bertanya terus kepada {who}: guna you, bukan he / she.", en:"You are asking {who} directly: use you, not he / she."})[S.lang], {who: WHO_NAME[st.who] || "them"}); if(st.ask && hs.some(h=>NOAUX.test(questionPart(h)) || NOAUX2.test(questionPart(h)))) return t.ownAskAux;
    const q = hs.some(h=>QWORD.test(questionPart(h)));
    // a miss with nothing specific to say points at a way to start (the bulb's first hint)
    const start = k0 ? " "+fmt(({zh:"可以这样开始：{k}", ms:"Boleh mula begini: {k}", en:"You could start: {k}"})[S.lang], {k: k0}) : "";
    return st.ask ? (q ? t.ownAskTopic : fmt(t.ownAskRetry, {who: WHO_NAME[st.who] || ({zh:"对方",ms:"dia",en:"them"})[S.lang]})) : t.ownRetry+start; }, good: t.ownGood,
   model: ()=>speak(st.line, null, false, true, voiceOf(st.who)), hearLabel: t.hearModel2,
   reveal: st.model ? px(st.model) : "",
   passModel: ()=>{ const m = st.model ? px(st.model) : ""; return m && st.lastHeard && window.TouchSpeech && !TouchSpeech.check(m, [st.lastHeard]).pass ? m : ""; },
   s1: ({zh:"先听对方说什么（点对话泡泡可以再听）", ms:"Dengar apa yang dia kata (tekan gelembung untuk dengar lagi)", en:"Listen to what they say (tap the bubble to hear it again)"})[S.lang],
   onTries: n=>{ if(n>=2) st.tries2 = true; },
   judge: heard=>{
    /* own.must: this turn exists for one part (a reason, an example, a next step) — it must be said */
    if(st.must && !heard.some(h=>st.must.some(k=>lemmaHit(" "+spNorm(h)+" ", k)))){ st.needMust = true; return false; }
    st.needMust = false;
    /* own.not: the very mistake this lesson teaches ("finish until", "can or not") never passes */
    st.hitNot = st.not ? (st.not.find(k=>heard.some(h=>(" "+spNorm(h)+" ").includes(" "+spNorm(k)+" "))) || "") : "";
    if(st.hitNot) return false;
    // an answer is a sentence: "We can lah." is not one (a greeting reply may be short)
    // "Yes, I do." and "Tea, please." are answers; one word is not (walkthrough 2026-09-26)
    const oneKey = heard.some(h=>(st.keys||[]).some(k=>spNorm(px(k))===spNorm(h)));
    if(!oneKey && !st.ask && !GREET.test(spNorm(st.line)) && !heard.some(h=>spNorm(h).split(" ").length>=2)){ st.tooShort = true; return false; }
    st.tooShort = false;
    // the lesson's mistake, said, is not a pass ("I have 56 years old", "My name Aisyah")
    st.slip = hardSlip(heard);
    if(st.slip) return false;
    /* asking the person in front of you: "how is she today" to Mei Ling is the he/she slip */
    st.wrongWho = false;
    if(st.ask && (st.keys||[]).some(k=>/\byou\b/.test(k)) && heard.every(h=>{ const q = questionPart(spNorm(h)); return /\b(he|she|his|her|him)\b/.test(q) && !/\byou\b/.test(q); })){ st.wrongWho = true; return false; }
    OWN_EXACT = !!st.exact;
    const hit = heard.find(h=>ownHit(h, st.keys, st.line, st.ask));
    st.lastHeard = hit || heard[0] || "";
    OWN_EXACT = false;
    if(hit){ heard.unshift(hit); pay(); }   // the result card shows heard[0]: show the answer that counted
    return !!hit;
   }});
  return;
 }

 if(st.kind==="vocab"){
  const inner = l.w.map((w,i)=>`<div class="vrow"><span class="en">${esc(w[0])}</span><span class="gl">${esc(S.lang==="ms"?w[2]:(S.lang==="zh"?w[1]:(w[4]||w[1]+" · "+w[2])))}</span><span class="ex" data-say="${esc(w[3]||"")}" role="button" tabindex="0">${esc(px(w[3]))}</span>${TTS?`<button class="spk" data-w="${esc(w[0])}" aria-label="play">${SPK_SVG}</button>`:""}</div>`).join("");
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.vocab), t.vocabSub+(TTS?" "+t.tapSpk:""), inner,
   `<button class="btn btn-primary btn-block" id="go">${t.continue}</button>`);
  box.querySelectorAll(".spk").forEach(b=>{ b.onclick=()=>speak(b.dataset.w,b); });
  $("go").onclick = ()=>{ P.xp+=5; nextStep(); };
  return;
 }
 if(st.kind==="listen"){
  if(!S.sound){
   // sound is muted — this step can't be played fairly; let the learner pass through
   box.innerHTML = stepShell(stepNum, esc(t.listen), t.listenMuted,
    `<div class="scenebox">🔇 ${esc(t.listenMuted)}</div>`,
    `<button class="btn btn-primary btn-block" id="go">${t.continue}</button>`);
   $("go").onclick = ()=>nextStep();
   return;
  }
  // pick up to 4 short vocab items (speakable: ≤3 words)
  const cand = l.w.filter(w=>w[0].replace(/[^a-zA-Z' ]/g,"").trim().split(/\s+/).length<=3).slice(0,4);
  const idxs = cand.map((_,i)=>i);
  const audioOrder = shuffle(idxs), wordOrder = shuffle(idxs);
  const WAVE = '<span class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
  const inner = `<div class="pairgrid">`+
   audioOrder.map((ai,row)=>{
    const wi = wordOrder[row];
    return `<button class="pa" data-i="${ai}">${SPK_ON_SVG}${WAVE}</button>`+
           `<button class="pw" data-i="${wi}">${esc(cand[wi][0])}</button>`;
   }).join("")+`</div>`;
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.listen), t.listenSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
  let selA=null, selW=null, pairs=0;
  function tryPair(){
   if(selA===null||selW===null) return;
   const a=box.querySelector(`.pa[data-i="${selA}"]`), w=box.querySelector(`.pw[data-i="${selW}"]`);
   if(selA===selW){
    a.classList.remove("sel"); w.classList.remove("sel");
    a.classList.add("paired"); w.classList.add("paired");
    pairs++;
    if(pairs===cand.length){ award(5,true); $("go").disabled=false; $("go").focus(); }
   } else {
    w.classList.add("shake");
    setTimeout(()=>{ w.classList.remove("shake","sel"); },420);
    a.classList.remove("sel");
   }
   selA=null; selW=null;
  }
  box.querySelectorAll(".pa").forEach(b=>{
   b.onclick=()=>{
    speak(cand[+b.dataset.i][0], b);
    box.querySelectorAll(".pa").forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel"); selA=+b.dataset.i; tryPair();
   };
  });
  box.querySelectorAll(".pw").forEach(b=>{
   b.onclick=()=>{
    box.querySelectorAll(".pw:not(.paired)").forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel"); selW=+b.dataset.i; tryPair();
   };
  });
  $("go").onclick=()=>nextStep();
  return;
 }
 if(st.kind==="patterns"){
  const inner = l.p.map(p=>`<div class="pat"><div class="tp">${esc(px(p.t)).replace(/___/g,"<b>___</b>")}</div><div class="nt">${esc(px(tri(p.n)))}</div></div>`).join("");
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.patterns), t.patternsSub, inner,
   `<button class="btn btn-primary btn-block" id="go">${t.continue}</button>`);
  $("go").onclick = ()=>{ P.xp+=5; nextStep(); };
  return;
 }
 if(st.kind==="fill" || st.kind==="mcq"){
  const isF = st.kind==="fill";
  const it = st.it;
  const correctText = px(it.o[it.a]);
  const opts = shuffle(it.o.map(px));
  const q = isF ? esc(px(it.q)).replace(/___/g,'<span class="qblank"></span>') : esc(px(tri(it.q)));
  const inner = mascotBubble(q)
   + opts.map((o,i)=>`<button class="opt" data-v="${esc(o)}"><span class="radio"></span><span>${esc(o)}</span></button>`).join("")
   + `<div id="fbslot"></div>`;
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(isF?t.fill:t.mcq), isF?t.fillSub:t.mcqSub, inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.check}</button>`);
  let sel=null;
  document.querySelectorAll(".opt").forEach(b=>{
   b.onclick=()=>{ document.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); sel=b; $("go").disabled=false; if(ALL_AUDIO()) speak(b.dataset.v); };
  });
  $("go").onclick=()=>{
   if(!sel) return;
   const ok = sel.dataset.v===correctText;
   document.querySelectorAll(".opt").forEach(b=>{
    b.disabled=true;
    if(b.dataset.v===correctText) b.classList.add("right");
    else if(b===sel&&!ok) b.classList.add("wrong");
   });
   const gained = award(5, ok);
   if(ok && !isF && !ALL_AUDIO()) speak(correctText);
   trackAnswer(ok, st.ref||{m:P.mi,l:P.li,k:st.kind,n:st.n}, px(isF?it.q:tri(it.q)), correctText, tri(it.e), sel.dataset.v, px(isF?it.q:tri(it.q))+" ["+opts.join(" / ")+"]");
   $("go").disabled = true;
   showFeedback(ok, {correct:correctText, expl:tri(it.e), xp:gained, onContinue:()=>nextStep()});
  };
  return;
 }
 if(st.kind==="subst"){
  const it = st.it;
  const inner = `<div class="pat"><div class="tp">${esc(px(it.tpl)).replace(/___/g,"<b>___</b>")}</div></div>
   <div class="bank">${shuffle(it.bank.map(px)).map(w=>`<button class="wchip" data-v="${esc(w)}">${esc(w)}</button>`).join("")}</div>
   <div id="fbslot"></div>`;
  box.innerHTML = stepShell(stepNum+" · +5 XP", esc(t.sub), t.subSub+(it.hint ? " "+tri(it.hint) : ""), inner,
   `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
  document.querySelectorAll(".wchip").forEach(b=>{
   b.onclick=()=>{
    if(ALL_AUDIO()) speak(b.dataset.v);
    document.querySelectorAll(".wchip").forEach(x=>x.classList.remove("used"));
    const sentence = px(it.tpl).replace("___", b.dataset.v).replace(/___/g, "___");
    /* 拼好的句子要听得到 —— 不然学生只是把词摆对位置，不知道它念起来怎样 */
    $("fbslot").innerHTML = ALL_AUDIO()
     ? `<div class="fb ok"><div class="h">${esc(T().subBuilt)}</div><div class="corr" data-say="${esc(String(sentence).replace(/\s+([.,!?;:])/g,"$1"))}" role="button" tabindex="0">${esc(sentence)}</div></div>`
     : `<div class="fb ok"><div class="h">${esc(T().subBuilt)}</div><div class="corr">${esc(sentence)}</div></div>`;
    $("go").classList.remove("hidden"); $("go").disabled = false;
   };
  });
  // practice, not a test: any tile makes a right sentence, so it earns XP but is not counted toward the 70%
  $("go").onclick=()=>{ if(!st.paid){ st.paid = true; P.xp += 5; $("sessxp").textContent = P.xp; } nextStep(); };
  return;
 }
 if(st.kind==="order" || st.kind==="trans"){
  const isO = st.kind==="order";
  const it = st.it;
  const sent = isO && it.q;                        // Level 2: the tiles are whole sentences
  const answer = sent ? it.w.map(px) : words(px(isO ? it.w.join(" ") : it.ans).split(" "));
  const pool = isO ? shuffle(answer.slice()) : shuffle(answer.concat(words((it.x||[]).map(px))));
  const title = isO ? t.order : t.trans;
  const sub = sent ? t.sorderSub : isO ? t.orderSub : t.transSub;
  const bubble = sent ? mascotBubble(esc(px(tri(it.q)))) : isO ? "" : mascotBubble(esc(px(tri(it.src))));
  const display = px(isO ? it.w.join(" ") : it.ans).replace(/\s+([.,!?;:])/g,"$1");
  const meta = {ref: st.ref||{m:P.mi,l:P.li,k:st.kind,n:st.n}, q: isO ? T().order : px(tri(it.src)), alts:(it.alt||[]).map(px), xw: it.xw || null};
  if(!isO) meta.meaning = px(tri(it.src));
  /* Level 2 orders whole sentences: the joined paragraph has no recording (C, not made) */
  if(sent && !ALL_AUDIO()) meta.quiet = true;
  renderBuilder(box, stepNum+" · +"+(isO?5:10)+" XP", title, sub, pool, answer, isO?5:10, it.e?tri(it.e):"", null, display, meta, bubble);
  return;
 }
 if(st.kind==="dialog"){
  renderDialog(box, stepNum, l);
  return;
 }
 if(st.kind==="speak"){
  const key = COURSE[P.mi].id+"-"+P.li;
  /* 挑这一课最完整的那一句来当录音示范。
     原本取的是对话第一句，结果第 9 课录到「Yes, a little.」（三个词的碎片）、
     第 12 课（数字与年龄）录到「My name is ...」，都不是该课在教的东西。
     规则：学生的台词里取最长的；一样长取前面那句（sort 是稳定的）。
     以前会先排除带 {NAME} 的句子（当时那种没有示范音档），结果第 2 课「My name is」
     录的是「What is your name?」—— 现在 voice.js 会在名字那里切开播，不必再躲。 */
  const ys = (l.d && l.d.lines || []).filter(x=>x.who==="Y" && x.ans);
  const yl = ys.slice().sort((a,b)=>b.ans.length - a.ans.length)[0];
  const rawModel = yl ? yl.ans : l.p[0].t;
  const sentence = px(rawModel).replace(/\s+([.,!?;:])/g,"$1");
  /* 示范就念画面上这一句，句尾标点要留着：音档的档名（voice.js key()）连句点一起算，
     以前把句点去掉，25 课的「先听一次示范」全都找不到音档，退回机械音又只念 3 个字 → 没声音。
     有学生名字的句子，voice.js 自己在名字那里切开、名字空一拍（「带学生名字的句子」）。 */
  const modelSay = sentence;
  box.innerHTML = stepShell("🎤 "+stepNum+" · +5 XP", esc(t.speakTitle), t.speakSub,
   `<div class="qsub" style="margin-bottom:8px">${esc(t.speakSay)}</div>
    <div class="speaksent"><div class="ss">“${esc(sentence)}”</div>
      <button class="btn btn-ghost hearbtn" id="hearbtn">${esc(t.hearModel)}</button></div>
    <div id="recbox"></div>`,
   `<button class="btn btn-ghost btn-block" id="go">${t.continue}</button>`);
  /* 先听示范 —— 学生没听过就开口，只会用母语的腔调去念，录下来还以为对了。
     录完之後这颗按钮还在，让他「自己的 vs 示范」来回对照。 */
  $("hearbtn").onclick = ()=>{ speak(modelSay, $("hearbtn")); };
  mountRecorder($("recbox"), key, ()=>{ P.xp += 5; $("sessxp").textContent = P.xp; xpFloat(5); });
  $("go").onclick = ()=>nextStep();
  return;
 }
}

function isPunct(w){ return /^[.,!?;:'"]+$/.test(String(w).trim()); }
function words(arr){ return arr.filter(w=>!isPunct(w)); }
function norm(arr){ return words(arr).join(" ").toLowerCase().replace(/[.,!?;:'"]/g,"").replace(/\s+/g," ").trim(); }

/* tap-to-build (order / translation / dialogue lines) */
/* A built sentence that is wrong says where (Marco 2026-09-26: 「学生可能会不知道他错在哪里」):
   the learner's words against the answer by their longest common order — a tile that is
   not in the answer is struck, the answer's words it replaced are marked, and each pair is
   said in a line ("here it is meet, not meets"). All the right words in the wrong order
   says so. An item may carry a reason for its decoy tiles (xw: {tile: tri}), added as 💡.
   Set by renderBuilder, read once by the next showFeedback. */
let BUILT_DIFF = null;
const GRAMMAR_WHY = {
 am:{zh:"英文句子要有 am / is / are：I am tired，不说 I tired。", ms:"Ayat Inggeris perlu am / is / are: I am tired, bukan I tired.", en:"English needs am / is / are: I am tired, not I tired."},
 is:{zh:"英文句子要有 am / is / are：It is hot，不说 It hot。", ms:"Ayat Inggeris perlu am / is / are: It is hot, bukan It hot.", en:"English needs am / is / are: It is hot, not It hot."},
 are:{zh:"英文句子要有 am / is / are：They are busy，不说 They busy。", ms:"Ayat Inggeris perlu am / is / are: They are busy, bukan They busy.", en:"English needs am / is / are: They are busy, not They busy."},
 a:{zh:"一个可数的东西前面要加 a：a bag、a teacher。", ms:"Satu benda yang boleh dikira perlu a: a bag, a teacher.", en:"One countable thing needs a: a bag, a teacher."},
 an:{zh:"元音开头的字前用 an：an apple、an engineer。", ms:"Sebelum bunyi vokal guna an: an apple, an engineer.", en:"Before a vowel sound use an: an apple, an engineer."},
 do:{zh:"问句要有 do：Do you…? / Where do you…?", ms:"Soalan perlu do: Do you…? / Where do you…?", en:"A question needs do: Do you…? / Where do you…?"},
 does:{zh:"he / she 的问句要有 does：Does she…? / Where does he…?", ms:"Soalan untuk he / she perlu does: Does she…?", en:"A he / she question needs does: Does she…?"},
 to:{zh:"这里要 to 接动词：want to go、need to buy。", ms:"Di sini perlu to sebelum kata kerja: want to go.", en:"Here to goes before the verb: want to go."},
};
function builtDiff(built, answer, xw, display, alts){
 /* word by word (a tile can be a phrase: "Let's going back"), against whichever right sentence
    is closest to what was built — the answer or one of its alternatives (walkthrough 2026-09-26:
    building an alternative's order was told the alternative's words were wrong) */
 const k = w=>String(w).toLowerCase().replace(/[’]/g,"'").replace(/[^a-z0-9']/g,"");
 const tileOf = []; const B = [];
 built.forEach(t=>String(t).split(/\s+/).forEach(w=>{ if(k(w)){ B.push(w); tileOf.push(t); } }));
 const cands = [{words: answer.flatMap(t=>String(t).split(/\s+/)), disp: display}].concat((alts||[]).map(a=>({words: String(a).split(/\s+/), disp: a})));
 const lcs = (X, Y)=>{ const n=X.length, m=Y.length, L=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--) L[i][j] = k(X[i])===k(Y[j]) ? L[i+1][j+1]+1 : Math.max(L[i+1][j], L[i][j+1]); return L; };
 let best = null;
 for(const c of cands){ const A = c.words.filter(w=>k(w)); const L = lcs(B, A); const score = L[0][0]*2 - A.length - B.length;
  if(!best || score > best.score) best = {A, L, score, disp: c.disp || c.words.join(" ")}; }
 const {A, L} = best, n = B.length, m = A.length;
 const inB = new Array(n).fill(false), inA = new Array(m).fill(false);
 for(let i=0,j=0;i<n&&j<m;){ if(k(B[i])===k(A[j])){ inB[i]=inA[j]=true; i++; j++; } else if(L[i+1][j]>=L[i][j+1]) i++; else j++; }
 const W = ({zh:{you:"你拼的：", swap:"这里要用 {r}，不是 {w}。", extra:"这里不用 {w}。", miss:"少了 {r}。", order:"字都对了，只是顺序不对。", many:"好几个地方不一样，对照上面的正确句子。"},
  ms:{you:"Susunan anda:", swap:"Di sini guna {r}, bukan {w}.", extra:"{w} tidak perlu di sini.", miss:"Tertinggal {r}.", order:"Semua perkataan betul, cuma susunannya salah.", many:"Beberapa tempat berbeza — bandingkan dengan ayat yang betul di atas."},
  en:{you:"You built:", swap:"Here it is {r}, not {w}.", extra:"No {w} here.", miss:"Missing: {r}.", order:"The words are right; the order is not.", many:"Several places differ — compare with the right sentence above."}})[S.lang];
 const sorted = x=>x.map(k).sort().join(" ");
 let wrong = B.map((w,i)=>inB[i]?-1:i).filter(i=>i>=0), missing = A.map((w,j)=>inA[j]?-1:j).filter(j=>j>=0);
 // pair each wrong word with the missing word most like it (live ~ lives, go ~ going), else in order
 const like = (a, b)=>{ a = k(a); b = k(b); if(!a || !b) return 0; if(a===b) return 3; if(a.slice(0,3)===b.slice(0,3)) return 2; return 0; };
 const pairs = [], usedM = new Set(), usedW = new Set();
 wrong.forEach(i=>{ let bj = -1, bs = 0; missing.forEach(j=>{ if(usedM.has(j)) return; const s = like(B[i], A[j]); if(s > bs){ bs = s; bj = j; } }); if(bj>=0){ pairs.push([i, bj]); usedM.add(bj); usedW.add(i); } });
 const restW = wrong.filter(i=>!usedW.has(i)), restM = missing.filter(j=>!usedM.has(j));
 // one wrong and one missing left in the same place is a swap; otherwise each is said on its own
 if(restW.length === 1 && restM.length === 1) pairs.push([restW[0], restM[0]]);
 // one wrong word for a missing phrase ("sorry" for "Excuse me") is a swap too
 else if(restW.length === 1 && restM.length > 1 && restM.every((j,x)=>!x || j===restM[x-1]+1)) { pairs.push([restW[0], restM[0]]); pairs.phrase = restM[0]; }
 else { restW.forEach(i=>pairs.push([i, -1])); restM.forEach(j=>pairs.push([-1, j])); }
 const clean = v=>String(v).replace(/[.,!?;:]+$/,"");
 // fold each missing word into the listed missing word just before it: one line per phrase
 // (a swap found by likeness — live for lives — stays one word)
 const listed = new Set(pairs.filter(p=>p[0]<0 || p[1]===pairs.phrase).map(p=>p[1])), tail = new Set();
 for(const j of missing) if((listed.has(j-1) || tail.has(j-1)) && !pairs.some(p=>p[1]===j && p[0]>=0)) tail.add(j);
 const runOf = j=>{ const o = []; for(let x=j+1; tail.has(x); x++) o.push(A[x]); return o; };
 for(let x=pairs.length-1; x>=0; x--) if(pairs[x][0]<0 && tail.has(pairs[x][1])) pairs.splice(x, 1);
 const lines = [];
 if(sorted(B)===sorted(A)){
  lines.push(esc(W.order));
  // two words swapped next to each other (rice chicken, How you are): say the English order
  for(let i=0;i<Math.min(B.length, A.length)-1;i++) if(k(B[i])===k(A[i+1]) && k(B[i+1])===k(A[i]) && k(B[i])!==k(B[i+1])){
   lines.push(fmt(({zh:"英文要说 {r}，不是 {w}。", ms:"Dalam bahasa Inggeris: {r}, bukan {w}.", en:"English says {r}, not {w}."})[S.lang],
    {r:`<b class="rt">${esc(clean(A[i]))} ${esc(clean(A[i+1]))}</b>`, w:`<b class="wr">${esc(clean(B[i]))} ${esc(clean(B[i+1]))}</b>`})); break; }
 }
 else if(pairs.length > 3) lines.push(esc(W.many));
 else pairs.slice(0,3).forEach(([i, j])=>{
  // a run of missing words next to each other is one phrase ("Excuse me", not 「少了 Excuse」 and 「少了 me」)
  const w = i>=0 ? B[i] : "", r = j>=0 ? [A[j]].concat(runOf(j)).join(" ") : "";
  let line = w && r && k(w)===k(r) ? fmt(({zh:"「{w}」的位置不对。", ms:"Kedudukan “{w}” salah.", en:"“{w}” is in the wrong place."})[S.lang], {w:`<b class="wr">${esc(clean(w))}</b>`})
   : w && r ? fmt(W.swap, {w:`<b class="wr">${esc(clean(w))}</b>`, r:`<b class="rt">${esc(clean(r))}</b>`})
   : w ? fmt(W.extra, {w:`<b class="wr">${esc(clean(w))}</b>`}) : fmt(W.miss, {r:`<b class="rt">${esc(clean(r))}</b>`});
  const tile = i>=0 ? tileOf[i] : "";
  let why = w && xw && (xw[tile] || xw[clean(tile)] || xw[clean(w)] || xw[clean(w).toLowerCase()]);
  // nothing written for it: a missing grammar word still gets its rule (walkthrough round 2: "Tertinggal am")
  if(!why && !w && r) why = GRAMMAR_WHY[k(r)] || null;
  if(why) line += `<br>💡 ${esc(px(tri(why)))}`;
  lines.push(line);
 });
 // the same tile's reason once, even when the tile was a phrase
 const seen = new Set(); const uniq = lines.filter(l=>{ const r = l.split("💡")[1]; if(!r) return true; if(seen.has(r)) return false; seen.add(r); return true; });
 return { you: esc(W.you), built: B.map((w,i)=>inB[i] ? esc(w) : `<span class="wr">${esc(w)}</span>`).join(" "),
  answer: (()=>{ let j = 0; return String(best.disp).split(/\s+/).map(w=>{ if(!k(w)) return esc(w); const hit = inA[j++]; return hit ? esc(w) : `<span class="rt">${esc(w)}</span>`; }).join(" ").replace(/\s+([.,!?;:])/g,"$1"); })(), lines: uniq };
}
function slashVariants(s){
 const m = String(s).match(/(\S+)\s*\/\s*(\S+)/);
 if(!m) return [s];
 return [s.replace(m[0], m[1]), s.replace(m[0], m[2].replace(/[.,!?]+$/, "")+(m[2].match(/[.,!?]+$/)||[""])[0])].flatMap(slashVariants);
}
function renderBuilder(box, lbl, title, sub, pool, answer, xp, expl, onDone, display, meta, bubble){
 const t = T();
 /* Tapping a tile is silent (Marco 2026-09-25: reading every tapped word got in the way;
    Duolingo reads the sentence). Nothing reads the learner's own arrangement: a wrong order
    read aloud is a wrong sentence heard in a real voice, and heard often enough it sticks
    (Marco 2026-09-25: 「如果我做错…硬按那个喇叭…以后我的语音就会很奇怪」). So the sentence
    is read only once Check says it is right; when it is wrong, the right one is on the
    answer sheet with a speaker, for the learner to hear on purpose. */
 const inner = `${bubble||""}<div class="bzrow"><div class="buildzone" id="bz"></div></div>
  <div class="bank" id="bk">${pool.map((w,i)=>`<button class="wchip" data-i="${i}" data-v="${esc(w)}">${esc(w)}</button>`).join("")}</div>
  <div id="fbslot"></div>`;
 box.innerHTML = stepShell(lbl, title, sub, inner,
  `<button class="btn btn-primary btn-block" id="go" disabled>${t.check}</button>`);
 const placed = [];
 function redraw(){
  $("bz").innerHTML = placed.map((p,ix)=>`<button class="wchip" data-ix="${ix}">${esc(p.v)}</button>`).join("");
  $("bz").querySelectorAll(".wchip").forEach(b=>{
   b.onclick=()=>{ const p=placed.splice(+b.dataset.ix,1)[0];
    document.querySelector(`#bk .wchip[data-i="${p.i}"]`).classList.remove("used"); redraw(); };
  });
  $("go").disabled = placed.length===0;
 }
 document.querySelectorAll("#bk .wchip").forEach(b=>{
  b.onclick=()=>{ if(b.classList.contains("used"))return; b.classList.add("used"); placed.push({v:b.dataset.v,i:b.dataset.i}); redraw(); };
 });
 $("go").onclick=()=>{
  /* 同一组词块常常不只拼得出一句对的话（「Now it is ten o'clock」「At six o'clock I go home」）。
     题目可以带 alt：[另一种完整的正确答案…]，用同一套 norm() 比对，对上任何一句都算对。
     对上的是 alt 时，viaAlt 是那一句（给画面显示学生自己拼的版本），再附上标准答案给他参考。 */
  const built = norm(placed.map(p=>p.v));
  let ok = built===norm(answer), viaAlt = "";
  if(!ok) viaAlt = ((meta&&meta.alts)||[]).find(a=>norm(String(a).split(/\s+/))===built) || "";
  if(viaAlt) ok = true;
  const std = display || answer.join(" ");
  BUILT_DIFF = ok ? null : builtDiff(placed.map(p=>p.v), answer, meta && meta.xw, std, (meta && meta.alts) || []);
  document.querySelectorAll(".wchip").forEach(b=>b.disabled=true);
  $("bz").classList.add(ok ? "bzok" : "bzno");
  // the whole sentence, read only when it is right — the learner's own when it was another right way
  if(ok && !(meta && meta.quiet)) speak(String(viaAlt || std).replace(/\s+([.,!?;:])/g,"$1"));
  $("go").disabled = true;
  if(meta) trackAnswer(ok, meta.ref, meta.q, std, expl, placed.map(p=>p.v).join(" "), (title && title!==meta.q ? title+" · " : "")+meta.q+" ["+pool.join(" / ")+"]");
  if(onDone){ onDone(ok, viaAlt); }
  else {
   const gained = award(xp, ok);
   showFeedback(ok, {correct:std, also:viaAlt?std:"", replay: viaAlt || std, expl:expl, xp:gained, quiet:!!(meta && meta.quiet),
    meaning:(meta&&meta.meaning)||"", onContinue:()=>nextStep()});
  }
 };
}

/* dialogue step */
function renderDialog(box, stepNum, l){
 const t = T();
 const stD = (P && P.steps && P.steps[P.idx]) || {};
 const lastY = (l.d.lines || []).map((x,i)=>x.who==="Y" ? i : -1).filter(i=>i>=0).pop();
 const d = l.d;
 const isBoss = !!l.boss || !!d.boss;
 const lines = d.lines;
 let li = 0;
 const rendered = [];
 function header(){
  const role = (typeof CONF!=="undefined" && CONF.flow==="l1" && t.roleNote) ? `<div class="qsub" style="margin:-4px 0 10px;font-size:12.5px">${esc(t.roleNote)}</div>` : "";
  const scene = px(tri(d.scene)).replace(/^\s*(scene|场景|situasi)\s*[:：]\s*/i, "");
  return `<div class="scenebox">📍 ${esc(t.sceneLbl)}: ${esc(scene)}</div>${role}<div id="dlog">${rendered.join("")}</div><div id="dwork"></div>`;
 }
 /* the gloss under their line: never the same English again, and in a Boss only for a Manglish line */
 const MANG = /\b(lah|lor|meh|leh|can,? can|got,? got|already lah)\b/i;
 const glossOf = line=>{ const g = line.g ? px(tri(line.g)) : ""; if(!g) return "";
  if(spNorm(g)===spNorm(px(line.en))) return "";
  if(isBoss && !MANG.test(line.en)) return ""; return g; };
 function pushThem(line){
  /* 每一行都可以点来听。播的就是画面上那一句（句尾标点要留着，音档档名连它一起算 ——
     以前每一句都去掉句点，结果对方的台词全部找不到音档）。
     带学生名字的句子交给 voice.js 在名字那里切开播。 */
  const sayable = px(line.en).replace(/\s+([.,!?;:])/g,"$1").replace(/\s+/g," ").trim();
  /* Level 2: heard before read — the line is played and its words stay covered until tapped */
  if(typeof CONF!=="undefined" && CONF.flow==="l2" && S.sound && TTS){
   rendered.push(`<div class="dline them"><span class="who">${esc(line.who)}</span><span class="bub"><span class="en covered" data-say="${esc(sayable)}" data-voice="${voiceOf(line.who)}" role="button" tabindex="0" onclick="this.classList.remove('covered')">${esc(px(line.en))}</span>${glossOf(line)?`<span class="gl covered" onclick="this.classList.remove('covered')">${esc(glossOf(line))}</span>`:""}</span></div>`);
   pendingSay.push({s:sayable, v:voiceOf(line.who)});
   return;
  }
  rendered.push(`<div class="dline them"><span class="who">${esc(line.who)}</span><span class="bub"><span class="en" data-say="${esc(sayable)}" data-voice="${voiceOf(line.who)}" role="button" tabindex="0">${esc(px(line.en))}</span>${glossOf(line)?`<span class="gl">${esc(glossOf(line))}</span>`:""}</span></div>`);
 }
 function pushYou(text){
  /* 学生刚拼好的那一句 —— 让他听一次正确的念法，再进下一句 */
  const sayable = String(text).replace(/\s+([.,!?;:])/g,"$1").trim();
  rendered.push(`<div class="dline you"><span class="who">${esc(t.you||"Y")}</span><span class="bub"><span class="en" data-say="${esc(sayable)}" role="button" tabindex="0">${esc(text)}</span></span></div>`);
 }
 /* the other person's new lines, played one after another once the screen is drawn */
 let pendingSay = [];
 function flushSay(){
  const q = pendingSay; pendingSay = [];
  if(!q.length || !S.sound || !window.TouchVoice) return;
  const mine = stD;
  let i = 0;
  const next = ()=>{ if(i>=q.length || !P || P.steps[P.idx]!==mine) return; const x = q[i++]; TouchVoice.say(x.s, {fallbackMaxWords:99, voice:x.v, onDone:()=>setTimeout(next, 350)}); };
  setTimeout(next, 300);
 }
 function advance(){ advance0(); flushSay(); }
 function advance0(){
  while(li<lines.length && lines[li].who!=="Y"){ pushThem(lines[li]); li++; }
  if(li>=lines.length){
   // dialogue done
   const PL = ({zh:["▶ 播放整段对话","■ 停止"], ms:["▶ Main seluruh perbualan","■ Berhenti"], en:["▶ Play the whole conversation","■ Stop"]})[S.lang] || ["▶","■"];
   box.innerHTML = stepShell((isBoss?t.boss:t.dialog)+" · +10 XP", esc(isBoss?t.boss:t.dialog), isBoss?t.bossSub:t.dialogSub,
    header()+`<button type="button" class="btn btn-ghost btn-block dplay" id="dplay">${esc(PL[0])}</button>`,
    `<button class="btn btn-primary btn-block" id="go">${t.continue}</button>`);
   $("go").onclick=()=>{ try{ if(window.TouchVoice) TouchVoice.stop(); }catch(e){} P.xp+=10; nextStep(); };
   /* The whole conversation, line after line, once it is done (Marco 2026-09-25: 「完成全部的
      时候…一键播放来回对话」). Each line is highlighted while it plays. Each character speaks
      in their own voice (data-voice), the learner in Bella's. */
   let playing = null;
   $("dplay").onclick = ()=>{
    const btn = $("dplay");
    const lines = [...document.querySelectorAll("#dlog .dline")];
    const clear = ()=>{ lines.forEach(x=>x.classList.remove("playing")); btn.textContent = PL[0]; playing = null; };
    if(playing){ try{ TouchVoice.stop(); }catch(e){} clear(); return; }
    if(!window.TouchVoice) return;
    const token = playing = {};
    btn.textContent = PL[1];
    let i = 0;
    const next = ()=>{
     if(playing !== token) return;
     lines.forEach(x=>x.classList.remove("playing"));
     if(i >= lines.length){ clear(); return; }
     const row = lines[i++], en = row.querySelector(".en[data-say]");
     row.classList.add("playing"); row.scrollIntoView({block:"nearest", behavior:"smooth"});
     TouchVoice.say(en ? en.dataset.say : "", {fallbackMaxWords: 99, voice: row.classList.contains("you") || !en ? "" : en.dataset.voice,
      onDone: ()=>setTimeout(next, 450)});
    };
    next();
   };
   return;
  }
  const line = lines[li];
  /* Level 1: the learner's last line is SAID, not built — judged on the words (any of its
     right forms), not counted; the right line then goes into the conversation as usual */
  if(stD.speakLast && li===lastY){
   const disp = px(line.ans).replace(/\s+([.,!?;:])/g,"$1");
   const targets = [sayable(line.ans)].concat((line.alt||[]).map(sayable));
   const hint = isBoss ? (line.c ? px(tri(line.c)) : "") : (line.g ? px(tri(line.g)) : "");
   box.innerHTML = stepShell("🎤 "+t.dialog, esc(t.dialog), t.dlgSay, header()+(hint ? `<div class="ownhint">${esc(t.ownHint)} ${esc(hint)}</div>` : "")+`<div id="sparea"></div>`,
    `<button class="btn btn-primary btn-block" id="go" disabled>${t.continue}</button>`);
   $("go").onclick = ()=>{ pushYou(disp); li++; advance(); };
   mountSpeech($("sparea"), {st:stD, key: COURSE[P.mi].id+"-"+P.li+"-dl", reveal: disp,
    targets: CONF.flow==="l2" ? null : targets, hints: [String(disp).split(/\s+/).slice(0,3).join(" ").replace(/[,.!?;:]+$/,"")+"…", disp],
    retry: ()=>whyText(stD.why, true),
    tips: CONF.flow==="l2", passModel: ()=>stD.byIdea ? disp : "",
    judge: heard=>{ const cs = targets.map(x=>TouchSpeech.check(x, heard)); const exact = cs.some(c=>c.pass); let ok = exact || (CONF.flow==="l2" && ideaCheck(targets, heard)); stD.byIdea = ok && !exact;
     stD.why = ok ? "" : (cs.slice().sort((a,b)=>b.ok/b.total - a.ok/a.total)[0].why || "");
     { const bad = hardSlip(heard) || decoyHit(heard, line, targets) || (ok ? meaningGuard(targets[0], heard) : ""); if(bad){ ok = false; stD.byIdea = false; stD.why = bad; } }
     return ok; }});
   window.scrollTo(0,document.body.scrollHeight);
   return;
  }
  const answer = words(px(line.ans).split(" "));
  const pool = shuffle(answer.concat(words((line.x||[]).map(px))));
  box.innerHTML = stepShell((isBoss?t.boss:t.dialog), esc(isBoss?t.boss:t.dialog), isBoss?t.bossSub:t.dialogSub,
   header()+`<div id="bwrap"></div>`, ``);
  const bw = $("bwrap");
  const hint = (!isBoss && line.g) ? px(tri(line.g)) : "";
  /* boss 没有英文提示，可是词块拼得出好几句都通的话（I am a teacher… / I am twenty years old…），
     没有情境就只能猜课本要哪一句。c 是一句「情境」：只给事实（你是厨师、你 30 岁），不给英文句子。 */
  const cue = (isBoss && line.c) ? px(tri(line.c)) : "";
  const sub = hint || cue || (isBoss?"":t.dialogSub);
  const holder = document.createElement("div");
  bw.appendChild(holder);
  const disp = px(line.ans).replace(/\s+([.,!?;:])/g,"$1");
  renderBuilder(holder, t.you, esc(t.you), sub, pool, answer, 0, "", (ok, viaAlt)=>{
   const gained = award(10, ok);
   showFeedback(ok, {correct:disp, also:viaAlt?disp:"", expl:(!isBoss&&line.g)?px(tri(line.g)):"", xp:gained,
    /* 用另一种说法答对的，对话纪录里留他自己拼的那句 */
    onContinue:()=>{ pushYou(viaAlt ? viaAlt.replace(/\s+([.,!?;:])/g,"$1") : disp); li++; advance(); }});
  }, disp,
  {ref:{m:P.mi,l:P.li,k:"dlg",n:li}, q:px(tri(line.c||line.g||d.scene)), alts:(line.alt||[]).map(px), xw: line.xw || null});
  window.scrollTo(0,document.body.scrollHeight);
 }
 advance();
}

/* ---------- finish ---------- */
function mistakesHTML(t){
 if(!P.wrongs.length) return "";
 const items = P.wrongs.slice(0,8).map(w=>`<div class="rev-item">
  <div class="rq">${esc(w.q)}</div>
  <div class="ra">✓ ${esc(t.answerIs)} ${esc(w.a)}</div>
  ${w.x?`<div class="rx">${esc(w.x)}</div>`:""}</div>`).join("");
 return `<div class="revlist"><div class="rlh">${esc(t.mistakes)}</div>${items}</div>`;
}
/* REDO MISSED: 「刚才错的 n 题已经再练过」 when the lesson brought any back */
function redoLine(t){
 const n = (P && P.mode==="lesson") ? Object.keys(P.redoKeys||{}).length : 0;
 return n ? `<div class="redoline">↻ ${esc(fmt(t.redoDone, {n}))}</div>` : "";
}
function finishLesson(){
 hideFeedback();
 killRec();
 const t = T();
 if(P.mode==="review"){
  const cleared = P.right, remain = S.review.length;
  S.xp += P.xp; bumpStreak(); addDayXP(P.xp); save();
  if(remain===0) confetti(32);
  $("medal").textContent = remain===0 ? "🌟" : "💪";
  $("medal").className = "medal";
  $("restitle").textContent = t.reviewDone;
  $("ressub").textContent = t.clearedMsg.replace("{c}",cleared).replace("{r}",remain);
  $("resxp").textContent = "+"+P.xp;
  $("resacc").textContent = (P.total?Math.round(P.right/P.total*100):100)+"%";
  $("resacclbl").textContent = t.accuracy;
  $("resstreak").textContent = S.streak.count;
 $("resstlbl").textContent = t.statStreak;
  $("resbtn").textContent = remain>0 ? t.reviewAgain : t.continue;
  $("resbtn").onclick = ()=> remain>0 ? startReview() : renderHome();
  const rb2 = $("resbtn2");
  if(remain>0){ rb2.textContent=t.backHome; rb2.classList.remove("hidden"); rb2.onclick=()=>renderHome(); }
  else rb2.classList.add("hidden");
  $("reslist").innerHTML = redoLine(t) + mistakesHTML(t);
  refreshChips();
  P = null;                                  // session over — prevents stale re-renders
  show("scr-result");
  return;
 }
 const l = COURSE[P.mi].lessons[P.li];
 const isBoss = !!l.boss;
 const key = COURSE[P.mi].id+"-"+P.li;
 const first = !S.done[key];                       // bonus only on first clear
 const acc = P.total? Math.round(P.right/P.total*100) : 100;
 /* 用画面上显示的四舍五入百分比来判：69.6% 显示成 70%，就要算及格，不然学生看到 70% 却没过 */
 const passed = !P.total || Math.round(100*P.right/P.total) >= Math.round(PASS*100);
 if(!passed) return finishPractised(key, acc, !first);
 const bonus = first ? 20 + (isBoss?20:0) : 0;
 const total = P.xp + bonus;
 S.done[key]=true;
 delete S.practised[key];
 S.xp += total;
 const milestone = bumpStreak();
 addDayXP(total);
 save();
 confetti(isBoss?64:32);
 if(milestone) setTimeout(()=>toast(t.streakMile.replace("{n}",S.streak.count)),1400);
 $("medal").textContent = isBoss?"👑":"🎉";
 $("medal").className = "medal";
 $("restitle").textContent = isBoss?t.bossDone:t.lessonDone;
 $("ressub").textContent = t.resSub + (isBoss?` (+20 ${t.bossBonus})`:"") + (P.skipped ? " "+fmt(t.skippedN, {n:P.skipped}) : "");
 $("resxp").textContent = "+"+total;
 $("resacc").textContent = acc+"%";
 $("resacclbl").textContent = t.accuracy;
 $("resstreak").textContent = S.streak.count;
 $("resstlbl").textContent = t.statStreak;
 // friction-free next step: primary CTA goes straight to the next lesson
 const nx = nextLesson();
 const b2 = $("resbtn2");
 if(nx){
  const nm = COURSE[nx.mi], nl = nm.lessons[nx.li];
  $("resbtn").textContent = t.nextUp+": "+tri(nl.t)+" ▶";
  $("resbtn").onclick = ()=>startLesson(nx.mi,nx.li);
  b2.textContent = t.backHome; b2.classList.remove("hidden");
  b2.onclick = ()=>renderHome();
 } else {
  $("resbtn").textContent = t.continue;
  $("resbtn").onclick = ()=>renderHome();
  b2.classList.add("hidden");
 }
 $("reslist").innerHTML = redoLine(t) + mistakesHTML(t);
 refreshChips();
 P = null;                                   // session over — prevents stale re-renders
 show("scr-result");
}

/* 没到 PASS：这次练习的 XP 照给（有练就有），但没有通关奖励、不记过关、不解锁 boss。
   结算页用学生的语言讲清楚要 70%、可以再做一次，主按钮就是重做这一课。
   wasDone：以前已经过关的课重做没到标准 —— 不收回过关，只告诉他进度还在。 */
function finishPractised(key, acc, wasDone){
 const t = T();
 const mi = P.mi, li = P.li;
 if(!wasDone) S.practised[key] = true;
 S.xp += P.xp;
 const milestone = bumpStreak();
 addDayXP(P.xp);
 save();
 if(milestone) setTimeout(()=>toast(t.streakMile.replace("{n}",S.streak.count)),1400);
 $("medal").textContent = "💪";
 $("medal").className = "medal";
 $("restitle").textContent = t.practisedTitle;
 $("ressub").textContent = (wasDone ? t.needPassDone : t.needPass).replace("{p}", Math.round(PASS*100)).replace("{a}", acc);
 $("resxp").textContent = "+"+P.xp;
 $("resacc").textContent = acc+"%";
 $("resacclbl").textContent = t.accuracy;
 $("resstreak").textContent = S.streak.count;
 $("resstlbl").textContent = t.statStreak;
 $("resbtn").textContent = t.retryLesson;
 $("resbtn").onclick = ()=>startLesson(mi, li);
 const b2 = $("resbtn2");
 b2.textContent = t.backHome; b2.classList.remove("hidden");
 b2.onclick = ()=>renderHome();
 $("reslist").innerHTML = redoLine(t) + mistakesHTML(t);
 refreshChips();
 P = null;
 show("scr-result");
}

/* ---------- profile & badges ---------- */
const BADGES = [
 {ic:"🎯", c:s=>s.lessons>=1,  t:{zh:["初次通关","完成第 1 关"],          ms:["Permulaan","Tamatkan 1 pelajaran"],        en:["First Steps","Complete 1 lesson"]}},
 {ic:"📘", c:s=>s.lessons>=5,  t:{zh:["小有所成","完成 5 关"],            ms:["5 Pelajaran","Tamatkan 5 pelajaran"],      en:["5 Lessons","Complete 5 lessons"]}},
 {ic:"📚", c:s=>s.lessons>=10, t:{zh:["学习达人","完成 10 关"],           ms:["10 Pelajaran","Tamatkan 10 pelajaran"],    en:["10 Lessons","Complete 10 lessons"]}},
 {ic:"👑", c:s=>s.bosses>=1,   t:{zh:["首胜 Boss","打败第一个 Boss"],     ms:["Boss Pertama","Tewaskan boss pertama"],    en:["Boss Slayer","Beat your first boss"]}},
 {ic:"🏆", c:s=>s.bosses>=5,   t:{zh:["五大 Boss 全胜","打败全部 5 个 Boss"], ms:["Semua Boss","Tewaskan kesemua 5 boss"], en:["All Bosses","Beat all 5 bosses"]}},
 {ic:"🎓", c:s=>s.lessons>=25, t:{zh:["课程毕业","完成全部 25 关"],       ms:["Tamat Kursus","Tamatkan semua 25 pelajaran"], en:["Graduate","Complete all 25 lessons"]}},
 {ic:"🔥", c:s=>s.streak>=3,   t:{zh:["三日连胜","连续学习 3 天"],        ms:["3 Hari Berturut","Belajar 3 hari berturut"], en:["3-Day Streak","Learn 3 days in a row"]}},
 {ic:"⚡", c:s=>s.streak>=7,   t:{zh:["七日连胜","连续学习 7 天"],        ms:["7 Hari Berturut","Belajar 7 hari berturut"], en:["7-Day Streak","Learn 7 days in a row"]}},
 {ic:"◆",  c:s=>s.xp>=500,    t:{zh:["500 XP","累计获得 500 XP"],        ms:["500 XP","Kumpul 500 XP"],                  en:["500 XP","Earn 500 XP total"]}},
 {ic:"💎", c:s=>s.xp>=1500,   t:{zh:["1500 XP","累计获得 1500 XP"],      ms:["1500 XP","Kumpul 1500 XP"],                en:["1500 XP","Earn 1500 XP total"]}},
];
function statsNow(){
 const lessons = Object.keys(S.done).length;
 const bosses = Object.keys(S.done).filter(k=>k.endsWith("-4")).length;
 return {lessons, bosses, xp:S.xp, streak:S.streak.count};
}
function defaultName(){ return T().student; }
const LVL_XP = 150;                                   // XP per level
function levelInfo(){
 const lv = Math.floor(S.xp/LVL_XP)+1;
 const into = S.xp % LVL_XP;
 return {lv, into, pct: Math.round(into/LVL_XP*100)};
}
/* ---------- XP Growth Tree (Profile) ----------
 * 5 stages bound to levelInfo(): Lv1 Seed · Lv2 Sprout · Lv3 Small · Lv4 Growing · Lv5+ Big. */
const XPTREE_STAGES = [
 {key:"seed",   name:{zh:"种子",  ms:"Benih",         en:"Seed"}},
 {key:"sprout", name:{zh:"嫩芽",  ms:"Tunas",         en:"Sprout"}},
 {key:"small",  name:{zh:"小树",  ms:"Pokok Kecil",   en:"Small Tree"}},
 {key:"growing",name:{zh:"成长树",ms:"Pokok Membesar",en:"Growing Tree"}},
 {key:"big",    name:{zh:"大树",  ms:"Pokok Besar",   en:"Big Tree"}},
];
function xpStageIndex(lv){ return Math.max(0, Math.min(4, lv-1)); }
function xpTreeSVG(stage){
 const POT = '<ellipse class="xg xg-soil" cx="74" cy="140" rx="40" ry="9" fill="#C9A66B"/><path class="xg xg-soil" d="M40 138h68l-7 8a6 6 0 0 1-5 3H52a6 6 0 0 1-5-3z" fill="#A9803F"/>';
 if(stage===0) return `<svg viewBox="0 0 148 150">${POT}<g class="xg xg-seed"><ellipse cx="74" cy="120" rx="11" ry="14" fill="#8B5E3C"/><path d="M74 120c-4-5-3-11 2-13" stroke="#6F4A2A" stroke-width="2" fill="none" stroke-linecap="round"/></g><path class="xg xg-trunk" d="M74 120v-6" stroke="#7FB069" stroke-width="3" stroke-linecap="round"/><path class="xg xg-leaf" d="M74 116c-7-2-11-8-9-13 6 0 10 5 9 13z" fill="#7FB069"/></svg>`;
 if(stage===1) return `<svg viewBox="0 0 148 150">${POT}<path class="xg xg-trunk" d="M74 138v-40" stroke="#6F8F4E" stroke-width="5" stroke-linecap="round"/><path class="xg xg-leaf" d="M74 110c-12-3-19-13-16-23 11 0 18 10 16 23z" fill="#7FB069"/><path class="xg xg-leaf" d="M74 104c12-4 20-13 17-24-11 0-19 11-17 24z" fill="#8FBE76"/></svg>`;
 if(stage===2) return `<svg viewBox="0 0 148 150">${POT}<path class="xg xg-trunk" d="M74 138V70" stroke="#7A5A38" stroke-width="8" stroke-linecap="round"/><circle class="xg xg-crown" cx="74" cy="58" r="30" fill="#7FB069"/><circle class="xg xg-crown" cx="74" cy="58" r="22" fill="#8FBE76"/></svg>`;
 if(stage===3) return `<svg viewBox="0 0 148 150">${POT}<path class="xg xg-trunk" d="M74 138V58" stroke="#6F4A2A" stroke-width="10" stroke-linecap="round"/><path class="xg xg-trunk" d="M74 92c-12-6-22-4-28-12M74 84c12-6 22-5 30-14" stroke="#6F4A2A" stroke-width="5" stroke-linecap="round" fill="none"/><circle class="xg xg-crown" cx="74" cy="46" r="34" fill="#7FB069"/><circle class="xg xg-crown" cx="74" cy="46" r="25" fill="#8FBE76"/><circle class="xg xg-bloom" cx="58" cy="40" r="5" fill="#F2C0D0"/><circle class="xg xg-bloom" cx="90" cy="50" r="5" fill="#F2C0D0"/><circle class="xg xg-bloom" cx="76" cy="30" r="5" fill="#FBE3A2"/></svg>`;
 return `<svg viewBox="0 0 148 150"><circle class="xg xg-bloom" cx="120" cy="26" r="13" fill="#FBD96B"/>${POT}<path class="xg xg-trunk" d="M74 138V52" stroke="#6F4A2A" stroke-width="13" stroke-linecap="round"/><path class="xg xg-trunk" d="M74 96c-16-8-28-6-36-16M74 84c16-8 30-7 40-18" stroke="#6F4A2A" stroke-width="7" stroke-linecap="round" fill="none"/><circle class="xg xg-crown" cx="74" cy="42" r="42" fill="#6FA058"/><circle class="xg xg-crown" cx="74" cy="42" r="31" fill="#8FBE76"/><circle class="xg xg-fruit" cx="58" cy="44" r="6" fill="#E0584F"/><circle class="xg xg-fruit" cx="90" cy="38" r="6" fill="#E0584F"/><circle class="xg xg-fruit" cx="76" cy="58" r="6" fill="#E0584F"/></svg>`;
}
let __xpTreeKey = null;
function renderXPTree(){
 const L = levelInfo();
 const si = xpStageIndex(L.lv);
 const stage = XPTREE_STAGES[si];
 $("xtStageLbl").textContent = T().xtGrowth;
 $("xtName").textContent = (stage.name[S.lang]||stage.name.en);
 $("xtBar").style.width = (si>=4 ? 100 : L.pct) + "%";
 $("xtHint").innerHTML = (si>=4)
   ? esc(T().xtMax)
   : esc(T().xtNext).replace("{n}", "<b>"+(LVL_XP-L.into)+"</b>").replace("{name}", esc(XPTREE_STAGES[si+1].name[S.lang]||XPTREE_STAGES[si+1].name.en));
 const stageKey = "stg"+si, replay = (__xpTreeKey!==stageKey);
 __xpTreeKey = stageKey;
 const host = $("xtStage");
 if(replay){ host.innerHTML=""; void host.offsetWidth; }
 host.innerHTML = xpTreeSVG(si);
}
function renderProfile(){
 const t = T(), st = statsNow(), L = levelInfo();
 const nm = S.name || defaultName();
 $("pname").textContent = nm;
 $("bigavatar").innerHTML = AVATAR_SVG;
 $("avlv").textContent = "Lv "+L.lv;
 renderXPTree();
 /* 模组全部开放（moduleUnlocked 永远是 true），以前用它找「第一个没解锁的模组」永远找不到，一律显示 Module 5。
    改成显示建议的下一课所在的模组；全部过关才显示最後一个。 */
 const recM = recommendedLesson();
 $("psub").textContent = CONF.name+" · "+t.module+" "+(recM ? recM.mi+1 : COURSE.length);
 $("pfbar").style.width = L.pct+"%";
 $("pflvltxt").textContent = t.toNext.replace("{n}", LVL_XP-L.into).replace("{lv}", L.lv+1);
 $("pstat-xp").textContent = st.xp;
 $("pstat-les").textContent = st.lessons+"/25";
 $("pstat-leslbl").textContent = t.statLessons;
 $("pstat-st").textContent = st.streak;
 $("pstat-stlbl").textContent = t.statStreak;
 $("achtitle").textContent = t.achTitle;
 $("achgrid").innerHTML = BADGES.map(b=>{
  const on = b.c(st);
  const [an,ad] = b.t.en;   // badge labels stay English (standard chrome)
  return `<div class="achip ${on?"earn":"lock"}" title="${esc(ad)}"><span class="aic">${on?b.ic:"🔒"}</span>
   <span class="at"><span class="an">${esc(an)}</span><span class="ad">${esc(ad)}</span></span></div>`;
 }).join("");
 refreshChips();
 show("scr-profile");
}

function editNameSheet(){
 const t = T();
 const o = sheet(`<h3>${esc(t.editName)}</h3>
  <input id="nminput" maxlength="20" value="${esc(S.name||"")}" placeholder="${esc(t.student)}">
  <div class="sheetrow">
   <button class="btn btn-ghost" id="mNo">${esc(t.cancel)}</button>
   <button class="btn btn-primary" id="mYes">${esc(t.saveName)}</button></div>`);
 const inp = o.querySelector("#nminput");
 inp.focus();
 o.querySelector("#mNo").onclick = closeOvl;
 o.querySelector("#mYes").onclick = ()=>{ S.name = inp.value.trim(); save(); closeOvl(); renderProfile(); };
}
$("nav-home").onclick = ()=>renderHome();
$("nav-profile").onclick = ()=>renderProfile();
$("editname").onclick = editNameSheet;

/* ---------- init ---------- */
function init(){
 if(!S.lang){ show("scr-lang"); return; }
 // existing users who saved a language before the name step existed: ask once
 // 在平台里名字是帐号的（顾问建的），不问
 if(!(SP && SP.platform) && !S.name && !store.get("askedname", false) && !(SP && SP.asked())){ showNameScreen(); return; }
 renderHome();
}
/* ---- Student View demo (shared/storage.js ?as=student) ----
   Marco 2026-09-25: staff should feel a student half-way through, and the Mistakes card
   should land on the wrong questions themselves, not on the course. So, for the preview
   student only: &demo=N — the first N lessons of this course are done (in order) and a
   few of their questions are waiting in review, as if answered wrong; &review=1 — open
   that review straight away. Real students never have PREVIEW. */
function previewDemo(){
 if(!PREVIEW) return false;
 const q = new URLSearchParams(location.search);
 const n = parseInt(q.get("demo") || "", 10);
 if(n >= 0){
  S.done = {}; S.practised = {};
  let c = 0;
  COURSE.forEach((m)=>m.lessons.forEach((l,li)=>{ if(c < n){ S.done[m.id+"-"+li] = true; c++; } }));
  const refs = [];
  COURSE.forEach((m,mi)=>m.lessons.forEach((L,li)=>{
   if(refs.length >= 6 || !S.done[m.id+"-"+li] || L.boss) return;
   if(L.f && L.f[0]) refs.push({m:mi, l:li, k:"fill", n:0});
   if(L.m && L.m[0] && refs.length < 6) refs.push({m:mi, l:li, k:"mcq", n:0});
  }));
  S.review = refs;
  S.xp = n * 10;
  const today = new Date().toISOString().slice(0,10);
  S.streak = {count: Math.max(1, Math.round(n/2)), last: today};
  save();
 }
 return q.get("review") === "1";
}
const PREVIEW_REVIEW = previewDemo();
init();
if(PREVIEW_REVIEW && S.review.length) startReview();
