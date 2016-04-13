/* **************************************************
 *
 * 该JS主要是UCdemo数据指标定义及换算规则
 * 包括原始数据录入、数据指标定义及各种换算逻辑运算
 *
 * ************************************************** */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////                              全局参数定义                             ////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 基础指标数
var uv_sum  = 0, //总uv 
	vi_sum  = 0, //总访问数
	pv_sum  = 0, //总pv
	cv_sum  = 0, //总cv
	tst_sum = 0, //总停留时间
	jo_sum  = 0; //总跳出率

// 曲线-静态数据
var curve_uv = [{'date': 1388505600, 'days': 7, 'uv': []}], 
    curve_vi = [{'date': 1388505600, 'days': 7, 'vi': []}], 
    curve_pv = [{'date': 1388505600, 'days': 7, 'pv': []}],
    curve_cv = [{'date': 1388505600, 'days': 7, 'cv': []}]

// 环图-静态数据
// type: od-频度[a,b,c], fid-渐进度[a,b,c], dd-深度[a,b,c], fd-忠诚度[a,b,c], other-[优秀,良好,普通]
// u - uid
var data_cycle = [
	{'type': 'od',    'data': [], 'sum': 0, 'u': [] },
	{'type': 'dd',    'data': [], 'sum': 0, 'u': [] },
	{'type': 'fid',   'data': [], 'sum': 0, 'u': [] },
	{'type': 'fd',    'data': [], 'sum': 0, 'u': [] },
	{'type': 'other', 'data': [] }
]

// 标签-静态数据
var data_tag = [
	{'tag': '会員',     'uv': 0, 'u': []},
	{'tag': '仮登録',   'uv': 0, 'u': []},
	{'tag': '大阪',     'uv': 0, 'u': []},
	{'tag': '女性',     'uv': 0, 'u': []},
	{'tag': '東京',     'uv': 0, 'u': []},
	{'tag': '先行登録', 'uv': 0, 'u': []},
	{'tag': 'SVIP',     'uv': 0, 'u': []},
	{'tag': 'RSS',      'uv': 0, 'u': []},
	{'tag': 'VIP',      'uv': 0, 'u': []},
	{'tag': '男性',     'uv': 0, 'u': []}
]

// 柱状图 - 静态数据
// [[频度, uv]，[渐进度, uv]，[深度, uv]，[忠诚度, uv]]
// list: cv-转化率, ast-平均停留时间, abr-跳出率;
// type: od-频度, fid-渐进度, dd-深度, fd-忠诚度;
// a: [具体数值, 当前条件总UV]
var data_quality = [
	{
		'list': 'cv',
		'data': [{'type':'od', 'a':[0,0], 'b':[0,0], 'c':[0,0]}, {'type':'fid', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'dd', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'fd', 'a':[0,0], 'b':[0,0], 'c':[0,0] } ]
	},
	{
		'list': 'ast',
		'data': [{'type':'od', 'a':[0,0], 'b':[0,0], 'c':[0,0]}, {'type':'fid', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'dd', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'fd', 'a':[0,0], 'b':[0,0], 'c':[0,0] } ]
	},
	{
		'list': 'abr',
		'data': [{'type':'od', 'a':[0,0], 'b':[0,0], 'c':[0,0]}, {'type':'fid', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'dd', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'fd', 'a':[0,0], 'b':[0,0], 'c':[0,0] } ]
	}
]

// 矩阵图 - 静态数据
// [[B]，[A]，[D]，[C]]
var data_sort = [{'user': 0, 'tag': [] }, {'user': 0, 'tag': []}, {'user': 0, 'tag': []}, {'user': 0, 'tag': []}];


// 转化 - 静态数据
var data_cv = [
	{'cv': 'A', 'name': '製品ページを閲覧する',       'uv': 0, 'sum': 0},
	{'cv': 'B', 'name': '会員登録',                   'uv': 0, 'sum': 0},
	{'cv': 'C', 'name': 'ブログサイトを閲覧する',     'uv': 0, 'sum': 0},
	{'cv': 'D', 'name': 'メルマガを購読する',         'uv': 0, 'sum': 0},
	{'cv': 'E', 'name': 'お問い合わせ',               'uv': 0, 'sum': 0},
	{'cv': 'F', 'name': '料金プランページを閲覧する', 'uv': 0, 'sum': 0}
]


// 导出 - email列表
var data_email = [];


/**
 * data_user
 * 用户原始数据表
 *
 * 格式说明：
	data_user = [
		{
			'uid': 'A',
			'tag': [1,2], //用户标签
			'vid': [
					{
						'id': 'A1',     //序号
						'data': '1',    //访问日期
						'pv': 3,        //pv
						'st': 600,      //停留时间
						'cv': ['A'],    //转化
						'cvn': '1',     //转化次数
						'jo': 0,        //是否跳出 1:是，0:否
						'sf': 'Google', //来源父级
						'sc': 'ptmind', //来源子集
						'od': 1,        //频度贡献
						'fid': 1,       //渐进度贡献
						'dd': 3,        //深度贡献
						'fd': 2,        //忠诚度贡献
					},
					....
				],
			'tvi': 3,              //总访次
			'tpv': 24,             //总PV
			'ast': 733.3333,       //平均停留时间
			'tcv': 4,              //总转化次数
			'br': 0,               //跳出率
			'tst': 2200,           //总停留时间
			'tbr': 0,              //总跳出
			'email': 'a@gmail.com' //用户邮箱
		}
		....
	]
 *
 */
var data_user = [
	{
		'uid': 'A',
		'tag': ['会員', '仮登録'],
		'vid': [
			{'id': 'A1', 'data': 1, 'pv': 3, 'st': 600, 'cv': 'A', 'cvn': 1, 'jo': 0, 'sf': 'Google', 'sc': 'ヒート　マップ', 'od': 1, 'fid': 1, 'dd': 3, 'fd': 2, }, 
			{'id': 'A2', 'data': 4, 'pv': 14, 'st': 1400, 'cv': 'B', 'cvn': 2, 'jo': 0, 'sf': 'Google', 'sc': 'Pt engine', 'od': 2, 'fid': 3, 'dd': 14, 'fd': 3, },
			{'id': 'A3', 'data': 6, 'pv': 7, 'st': 200, 'cv': 'A', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 3, 'fid': 2, 'dd': 7, 'fd': 4, }, 
		],
		'tvi': 3,
		'tpv': 24, 
		'ast': 733.3333,
		'tcv': 4,
		'br': 0,
		'tst': 2200,
		'tbr': 0,
		'email': 'leevis@gmail.com'
	},
	{
		'uid': 'B',
		'tag': ['仮登録', '大阪'],
		'vid': [
			{'id': 'B1', 'data': 2, 'pv': 4, 'st': 500, 'cv': 'C', 'cvn': 1, 'jo': 0, 'sf': 'Facebook', 'sc': 'Facebook/20140110.html', 'od': 1, 'fid': 1, 'dd': 4, 'fd': 1, }, 
			{'id': 'B2', 'data': 3, 'pv': 6, 'st': 900, 'cv': 'C', 'cvn': 1, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'http://matome.naver.jp/odai/2133508118907953101', 'od': 2, 'fid': 1, 'dd': 6, 'fd': 2, },
			{'id': 'B3', 'data': 6, 'pv': 12, 'st': 1300, 'cv': 'B', 'cvn': 1, 'jo': 0, 'sf': 'http://gooddesignweb.com', 'sc': 'http://gooddesignweb.com/page/5', 'od': 3, 'fid': 3, 'dd': 12, 'fd': 3, }, 
			{'id': 'B4', 'data': 7, 'pv': 5, 'st': 350, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 4, 'fid': 1, 'dd': 5, 'fd': 4, }, 
		],
		'tvi': 4,
		'tpv': 27, 
		'ast': 675,
		'tcv': 3,
		'br': 0,
		'tst': 2700,
		'tbr': 0,
		'email': 'robertying@gmail.com'
	},
	{
		'uid': 'C',
		'tag': ['会員'],
		'vid': [
			{'id': 'C1', 'data': 1, 'pv': 1, 'st': 200, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'Direct', 'sc': 'Direct', 'od': 1, 'fid': 3, 'dd': 1, 'fd': 6, }, 
			{'id': 'C2', 'data': 3, 'pv': 2, 'st': 300, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Yahoo', 'sc': 'Pt engine', 'od': 2, 'fid': 2, 'dd': 2, 'fd': 7, },
			{'id': 'C3', 'data': 4, 'pv': 5, 'st': 600, 'cv': 'A', 'cvn': 2, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'Pt engine', 'od': 3, 'fid': 1, 'dd': 5, 'fd': 8, }, 
			{'id': 'C4', 'data': 6, 'pv': 4, 'st': 1000, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 4, 'fid': 2, 'dd': 4, 'fd': 9, }, 
			{'id': 'C5', 'data': 7, 'pv': 2, 'st': 800, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 5, 'fid': 1, 'dd': 2, 'fd': 10, }, 
		],
		'tvi': 5,
		'tpv': 14, 
		'ast': 580,
		'tcv': 4,
		'br': 20,
		'tst': 2900,
		'tbr': 1,
		'email': 'dennis@gmail.com'
	},
	{
		'uid': 'D',
		'tag': ['女性', '東京'],
		'vid': [
			{'id': 'D1', 'data': 2, 'pv': 4, 'st': 550, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'http://www.okodukaiseikatsu.com', 'sc': 'http://www.okodukaiseikatsu.com	http://www.okodukaiseikatsu.com/click/?right_bn2', 'od': 1, 'fid': 2, 'dd': 4, 'fd': 3, }, 
			{'id': 'D2', 'data': 4, 'pv': 13, 'st': 260, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 2, 'fid': 2, 'dd': 13, 'fd': 4, },
			{'id': 'D3', 'data': 5, 'pv': 10, 'st': 740, 'cv': 'A', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 3, 'fid': 1, 'dd': 10, 'fd': 5, }, 
			{'id': 'D4', 'data': 6, 'pv': 3, 'st': 500, 'cv': 'A', 'cvn': 2, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 4, 'fid': 1, 'dd': 3, 'fd': 6, }, 
			{'id': 'D5', 'data': 7, 'pv': 4, 'st': 600, 'cv': 'B', 'cvn': 2, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 5, 'fid': 1, 'dd': 4, 'fd': 7, }, 
		],
		'tvi': 5,
		'tpv': 34, 
		'ast': 530,
		'tcv': 5,
		'br': 0,
		'tst': 2650,
		'tbr': 0,
		'email': 'godot@yahoo.co.jp'
	},
	{
		'uid': 'E',
		'tag': ['会員', '先行登録'],
		'vid': [
			{'id': 'E1', 'data': 2, 'pv': 5, 'st': 600, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Google', 'sc': 'ocnアクセス解析', 'od': 1, 'fid': 6, 'dd': 5, 'fd': 12, }, 
			{'id': 'E2', 'data': 3, 'pv': 6, 'st': 410, 'cv': 'C', 'cvn': 1, 'jo': 0, 'sf': 'Google', 'sc': 'ocnアクセス解析', 'od': 2, 'fid': 1, 'dd': 6, 'fd': 13, },
			{'id': 'E3', 'data': 6, 'pv': 7, 'st': 390, 'cv': 'D', 'cvn': 2, 'jo': 0, 'sf': 'Google', 'sc': 'ocnアクセス解析', 'od': 3, 'fid': 3, 'dd': 7, 'fd': 14, }, 
		],
		'tvi': 3,
		'tpv': 18, 
		'ast': 466.66666,
		'tcv': 3,
		'br': 0,
		'tst': 1400,
		'tbr': 0,
		'email': 'dawn@yahoo.co.jp'
	},
	{
		'uid': 'F',
		'tag': ['RSS'],
		'vid': [
			{'id': 'F1', 'data': 1, 'pv': 19, 'st': 600, 'cv': 'D', 'cvn': 2, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス解析 シームレス', 'od': 1, 'fid': 12, 'dd': 19, 'fd': 3, }, 
			{'id': 'F2', 'data': 5, 'pv': 15, 'st': 430, 'cv': 'C', 'cvn': 3, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス解析 シームレス', 'od': 2, 'fid': 4, 'dd': 15, 'fd': 4, },
			{'id': 'F3', 'data': 7, 'pv': 9, 'st': 680, 'cv': 'B', 'cvn': 4, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 3, 'fid': 2, 'dd': 9, 'fd': 5, }, 
		],
		'tvi': 3,
		'tpv': 43, 
		'ast': 570,
		'tcv': 9,
		'br': 0,
		'tst': 1710,
		'tbr': 0,
		'email': 'george@gmail.com'
	},
	{
		'uid': 'G',
		'tag': ['女性'],
		'vid': [
			{'id': 'G1', 'data': 2, 'pv': 10, 'st': 550, 'cv': 'E', 'cvn': 1, 'jo': 0, 'sf': 'http://www.a8.net', 'sc': 'http://www.a8.net/a8v2/asSearchAction.do', 'od': 1, 'fid': 4, 'dd': 10, 'fd': 7, }, 
			{'id': 'G2', 'data': 2, 'pv': 5, 'st': 650, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'http://www.a8.net', 'sc': 'http://www.a8.net/a8v2/asSearchAction.do', 'od': 2, 'fid': 0.5, 'dd': 5, 'fd': 8, },
			{'id': 'G3', 'data': 4, 'pv': 6, 'st': 780, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Google', 'sc': 'コピーガード解除ソフト無料', 'od': 3, 'fid': 2, 'dd': 6, 'fd': 9, }, 
			{'id': 'G4', 'data': 5, 'pv': 1, 'st': 100, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'Direct', 'sc': 'Direct', 'od': 4, 'fid': 1, 'dd': 1, 'fd': 10, }, 
			{'id': 'G5', 'data': 5, 'pv': 2, 'st': 350, 'cv': 'A', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'ocnアクセス解析', 'od': 5, 'fid': 0.5, 'dd': 2, 'fd': 11, }, 
			{'id': 'G6', 'data': 5, 'pv': 4, 'st': 550, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'ocnアクセス解析', 'od': 6, 'fid': 0.5, 'dd': 4, 'fd': 12, }, 
			{'id': 'G7', 'data': 7, 'pv': 4, 'st': 500, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 7, 'fid': 2, 'dd': 4, 'fd': 13, }, 
		],
		'tvi': 7,
		'tpv': 32, 
		'ast': 497.142142857,
		'tcv': 5,
		'br': 28.57,
		'tst': 3480,
		'tbr': 1,
		'email': 'whr@gmail.com'
	},
	{
		'uid': 'H',
		'tag': ['先行登録', 'RSS'],
		'vid': [
			{'id': 'H1', 'data': 2, 'pv': 1, 'st': 100, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'http://www.youtube.com', 'sc': 'http://www.youtube.com/watch?v=qa1JpFSqRRw', 'od': 1, 'fid': 7, 'dd': 1, 'fd': 12, }, 
			{'id': 'H2', 'data': 3, 'pv': 1, 'st': 50, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'http://www.youtube.com', 'sc': 'http://www.youtube.com/watch?v=qSDdd135YUJ', 'od': 2, 'fid': 1, 'dd': 1, 'fd': 13, },
			{'id': 'H3', 'data': 3, 'pv': 5, 'st': 600, 'cv': 'A', 'cvn': 2, 'jo': 0, 'sf': 'Facebook', 'sc': 'Facebook', 'od': 3, 'fid': 0.5, 'dd': 5, 'fd': 14, }, 
			{'id': 'H4', 'data': 7, 'pv': 3, 'st': 400, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Google', 'sc': 'アクセス数 解析', 'od': 4, 'fid': 4, 'dd': 3, 'fd': 15, }, 
		],
		'tvi': 4,
		'tpv': 10, 
		'ast': 287.5,
		'tcv': 2,
		'br': 50,
		'tst': 1150,
		'tbr': 2,
		'email': 'tangdh@gmail.com'
	},
	{
		'uid': 'I',
		'tag': ['仮登録', '東京'],
		'vid': [
			{'id': 'I1', 'data': 1, 'pv': 4, 'st': 480, 'cv': 'C', 'cvn': 2, 'jo': 0, 'sf': 'Yahoo', 'sc': 'ヒートマップ', 'od': 1, 'fid': 3, 'dd': 4, 'fd': 2, }, 
			{'id': 'I2', 'data': 4, 'pv': 6, 'st': 556, 'cv': 'D', 'cvn': 2, 'jo': 0, 'sf': 'Google', 'sc': 'ヒートマップ', 'od': 2, 'fid': 3, 'dd': 6, 'fd': 3, },
			{'id': 'I3', 'data': 5, 'pv': 5, 'st': 790, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 3, 'fid': 1, 'dd': 5, 'fd': 4, }, 
			{'id': 'I4', 'data': 7, 'pv': 2, 'st': 1200, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 4, 'fid': 2, 'dd': 2, 'fd': 5, }, 
		],
		'tvi': 4,
		'tpv': 17, 
		'ast': 756.5,
		'tcv': 5,
		'br': 25,
		'tst': 3026,
		'tbr': 0,
		'email': 'lilaiz@yahoo.co.jp'
	},
	{
		'uid': 'J',
		'tag': ['大阪', '東京', 'VIP'],
		'vid': [
			{'id': 'J1', 'data': 3, 'pv': 18, 'st': 980, 'cv': 'A', 'cvn': 3, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス解析 東京', 'od': 1, 'fid': 10, 'dd': 18, 'fd': 4, }, 
			{'id': 'J2', 'data': 4, 'pv': 5, 'st': 854, 'cv': 'E', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス解析', 'od': 2, 'fid': 1, 'dd': 5, 'fd': 5, },
			{'id': 'J3', 'data': 5, 'pv': 6, 'st': 760, 'cv': 'C', 'cvn': 3, 'jo': 0, 'sf': 'Google', 'sc': 'アクセス解析 東京', 'od': 3, 'fid': 1, 'dd': 6, 'fd': 6, }, 
			{'id': 'J4', 'data': 6, 'pv': 1, 'st': 600, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'http://gooddesignweb.com', 'sc': 'http://gooddesignweb.com/page/7', 'od': 4, 'fid': 1, 'dd': 1, 'fd': 7, }, 
			{'id': 'J5', 'data': 6, 'pv': 1, 'st': 100, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'Direct', 'sc': 'Direct', 'od': 5, 'fid': 0.5, 'dd': 1, 'fd': 8, }, 
			{'id': 'J6', 'data': 7, 'pv': 2, 'st': 1000, 'cv': 'C', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 6, 'fid': 1, 'dd': 2, 'fd': 9, }, 
		],
		'tvi': 6,
		'tpv': 33, 
		'ast': 715.666666,
		'tcv': 8,
		'br': 33.33,
		'tst': 4294,
		'tbr': 2,
		'email': 'lig@yahoo.co.jp'
	},
	{
		'uid': 'K',
		'tag': [],
		'vid': [
			{'id': 'K1', 'data': 2, 'pv': 1, 'st': 50, 'cv': '', 'cvn': 0, 'jo': 1, 'sf':'Yahoo', 'sc': 'ヒートマップ', 'od': 1, 'fid': 15, 'dd': 1, 'fd': 7, }, 
		],
		'tvi': 1,
		'tpv': 1, 
		'ast': 50,
		'tcv': 0,
		'br': 100,
		'tst': 50,
		'tbr': 1,
		'email': 'summer@yahoo.co.jp'
	},
	{
		'uid': 'L',
		'tag': ['会員','大阪','男性'],
		'vid': [
			{'id': 'L1', 'data': 4, 'pv': 3, 'st': 120, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Facebook', 'sc': 'http://m.facebook.com/l.php?u=http%3A%2F%2Fwww.ptengine.jp%2F&h=-AQFCi8Vv&enc=AZNjSBJwtfqhn9AivSHU3_9KYHSXq4DOCv8twgJDXqtGi8yrd6x8AX6xaCs2DSuuM6Kv2rJbufgFJIt-WLp2MRt45zSu2rYu86B6E1BPn355ZqFX076GIs-EB3Nc3ixnE6da_8gNPZU0vcgawMp1bkk3&s=1', 'od': 1, 'fid': 13, 'dd': 3, 'fd': 30, }, 
			{'id': 'L2', 'data': 4, 'pv': 5, 'st': 360, 'cv': 'E', 'cvn': 1, 'jo': 0, 'sf': 'Facebook', 'sc': 'http://m.facebook.com/l.php?u=http%3A%2F%2Fwww.ptengine.jp%2F&h=-AQFCi8Vv&enc=AZNjSBJwtfqhn9AivSHU3_9KYHSXq4DOCv8twgJDXqtGi8yrd6x8AX6xaCs2DSuuM6Kv2rJbufgFJIt-WLp2MRt45zSu2rYu86B6E1BPn355ZqFX076GIs-EB3Nc3ixnE6da_8gNPZU0vcgawMp1bkk3&s=1', 'od': 2, 'fid': 0.5, 'dd': 5, 'fd': 31, }, 
		],
		'tvi': 2,
		'tpv': 8, 
		'ast': 240,
		'tcv': 1,
		'br': 0,
		'tst': 480,
		'tbr': 0,
		'email': 'cz@gmail.com'
	},
	{
		'uid': 'M',
		'tag': ['東京', 'RSS', '男性'],
		'vid': [
			{'id': 'M1', 'data': 1, 'pv': 12, 'st': 1500, 'cv': 'B', 'cvn': 5, 'jo': 0, 'sf': 'Google', 'sc': '無料アクセスカウンター', 'od': 1, 'fid': 5, 'dd': 12, 'fd': 21, }, 
			{'id': 'M2', 'data': 1, 'pv': 15, 'st': 680, 'cv': 'C', 'cvn': 3, 'jo': 0, 'sf': 'Yahoo', 'sc': '無料アクセスカウンター', 'od': 2, 'fid': 0.5, 'dd': 15, 'fd': 22, },
			{'id': 'M3', 'data': 1, 'pv': 5, 'st': 210, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス数解析', 'od': 3, 'fid': 0.5, 'dd': 5, 'fd': 23, }, 
			{'id': 'M4', 'data': 7, 'pv': 3, 'st': 500, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Facebook', 'sc': 'http://www.facebook.com/l.php?u=http%3A%2F%2Fwww.ptengine.jp%2F&h=9AQFSFxleAQHDgAh8hgdNpiB51Rhm4XamoiSJv_Gt-U6fAQ&s=1', 'od': 4, 'fid': 6, 'dd': 3, 'fd': 24, }, 
			{'id': 'M5', 'data': 7, 'pv': 4, 'st': 840, 'cv': 'A', 'cvn': 2, 'jo': 0, 'sf': 'Facebook', 'sc': 'http://www.facebook.com/l.php?u=http%3A%2F%2Fwww.ptengine.jp%2F&h=9AQFSFxleAQHDgAh8hgdNpiB51Rhm4XamoiSJv_Gt-U6fAQ&s=1', 'od': 5, 'fid': 0.5, 'dd': 4, 'fd': 25, }, 
			{'id': 'M6', 'data': 7, 'pv': 14, 'st': 520, 'cv': 'D', 'cvn': 3, 'jo': 0, 'sf': 'Facebook', 'sc': 'http://www.facebook.com/l.php?u=http%3A%2F%2Fwww.ptengine.jp%2F&h=_AQFbkb68AQH9xjlw8nVxSgVbyAuBQDuBEZ3tVQpCksh20g&s=1', 'od': 6, 'fid': 0.5, 'dd': 14, 'fd': 26, }, 
			{'id': 'M7', 'data': 7, 'pv': 28, 'st': 690, 'cv': 'A', 'cvn': 5, 'jo': 0, 'sf': 'Google', 'sc': '無料アクセスカウンター', 'od': 7, 'fid': 0.5, 'dd': 28, 'fd': 27, }, 
		],
		'tvi': 7,
		'tpv': 81, 
		'ast': 705.71428571,
		'tcv': 18,
		'br': 0,
		'tst': 4940,
		'tbr': 0,
		'email': 'mike.x@gmail.com'
	},
	{
		'uid': 'N',
		'tag': ['先行登録', 'SVIP'],
		'vid': [
			{'id': 'N1', 'data': 3, 'pv': 1, 'st': 1200, 'cv': 'F', 'cvn': 1, 'jo': 1, 'sf': 'Yahoo', 'sc': 'ヒートマップ', 'od': 1, 'fid': 8, 'dd': 1, 'fd': 15, }, 
			{'id': 'N2', 'data': 3, 'pv': 5, 'st': 600, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス数解析', 'od': 2, 'fid': 0.5, 'dd': 5, 'fd': 16, },
		],
		'tvi': 2,
		'tpv': 6, 
		'ast': 900,
		'tcv': 2,
		'br': 50,
		'tst': 1800,
		'tbr': 1,
		'email': 'jerome@yahoo.co.jp'
	},
	{
		'uid': 'O',
		'tag': ['会員', '先行登録', '男性'],
		'vid': [
			{'id': 'O1', 'data': 6, 'pv': 12, 'st': 1400, 'cv': 'B', 'cvn': 2, 'jo': 0, 'sf': 'Facebook', 'sc': 'http://keitai-seo.jugem.jp', 'od': 1, 'fid': 11, 'dd': 12, 'fd': 18, }, 
			{'id': 'O2', 'data': 6, 'pv': 1, 'st': 410, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'Google', 'sc': 'ヒートマップ', 'od': 2, 'fid': 0.5, 'dd': 1, 'fd': 19, },
			{'id': 'O3', 'data': 6, 'pv': 3, 'st': 150, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Yahoo', 'sc': 'Yahoo', 'od': 3, 'fid': 0.5, 'dd': 3, 'fd': 20, },
		],
		'tvi': 3,
		'tpv': 16, 
		'ast': 653.333333,
		'tcv': 2,
		'br': 33.33,
		'tst': 1960,
		'tbr': 1,
		'email': 'kyletu@yahoo.co.jp'
	},
	{
		'uid': 'P',
		'tag': ['仮登録', '大阪', '女性', 'RSS'],
		'vid': [
			{'id': 'P1', 'data': 2, 'pv': 3, 'st': 500, 'cv': 'E', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'ヒートマップ', 'od': 1, 'fid': 2, 'dd': 3, 'fd': 24, }, 
			{'id': 'P2', 'data': 3, 'pv': 2, 'st': 100, 'cv': 'F', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 2, 'fid': 1, 'dd': 2, 'fd': 25, },
			{'id': 'P3', 'data': 3, 'pv': 5, 'st': 400, 'cv': 'F', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス 解析', 'od': 3, 'fid': 0.5, 'dd': 5, 'fd': 26, },
			{'id': 'P4', 'data': 5, 'pv': 1, 'st': 200, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'Direct', 'sc': 'Direct', 'od': 4, 'fid': 2, 'dd': 1, 'fd': 27, },
		],
		'tvi': 4,
		'tpv': 11, 
		'ast': 300,
		'tcv': 3,
		'br': 25,
		'tst': 1200,
		'tbr': 1,
		'email': 'hunk@yahoo.co.jp'
	},
	{
		'uid': 'Q',
		'tag': ['会員', '仮登録', '女性', '東京', 'SVIP'],
		'vid': [
			{'id': 'Q1', 'data': 1, 'pv': 10, 'st': 500, 'cv': 'A', 'cvn': 2, 'jo': 0, 'sf': 'Yahoo', 'sc': 'Yahoo', 'od': 1, 'fid': 1, 'dd': 10, 'fd': 28, }, 
			{'id': 'Q2', 'data': 2, 'pv': 14, 'st': 700, 'cv': 'D', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 2, 'fid': 1, 'dd': 14, 'fd': 29, },
			{'id': 'Q3', 'data': 3, 'pv': 3, 'st': 600, 'cv': 'C', 'cvn': 2, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 3, 'fid': 1, 'dd': 3, 'fd': 30, },
			{'id': 'Q4', 'data': 5, 'pv': 4, 'st': 560, 'cv': 'C', 'cvn': 1, 'jo': 0, 'sf': 'Google', 'sc': 'Pt engine', 'od': 4, 'fid': 2, 'dd': 4, 'fd': 31, },
			{'id': 'Q5', 'data': 6, 'pv': 13, 'st': 870, 'cv': 'B', 'cvn': 3, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'matome.naver.jp', 'od': 5, 'fid': 1, 'dd': 13, 'fd': 32, },
			{'id': 'Q6', 'data': 6, 'pv': 24, 'st': 880, 'cv': 'F', 'cvn': 6, 'jo': 0, 'sf': 'Google', 'sc': 'アクセス解析 比較', 'od': 6, 'fid': 0.5, 'dd': 24, 'fd': 33, },
			{'id': 'Q7', 'data': 7, 'pv': 1, 'st': 200, 'cv': 'C', 'cvn': 1, 'jo': 1, 'sf': 'Yahoo', 'sc': 'アクセス解析', 'od': 7, 'fid': 1, 'dd': 1, 'fd': 34, },
		],
		'tvi': 7,
		'tpv': 69, 
		'ast': 615.71428571,
		'tcv': 16,
		'br': 14.28,
		'tst': 4310,
		'tbr': 1,
		'email': 'sam@yahoo.co.jp'
	},
	{
		'uid': 'R',
		'tag': ['女性'],
		'vid': [
			{'id': 'R1', 'data': 6, 'pv': 2, 'st': 600, 'cv': 'B', 'cvn': 1, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'http://t.co/EOrHLr0vaZ', 'od': 1, 'fid': 5, 'dd': 2, 'fd': 4, }, 
			{'id': 'R2', 'data': 6, 'pv': 1, 'st': 700, 'cv': 'B', 'cvn': 1, 'jo': 1, 'sf': 'matome.naver.jp', 'sc': 'http://keitai-seo.jugem.jp', 'od': 2, 'fid': 0.5, 'dd': 1, 'fd': 5, },
		],
		'tvi': 2,
		'tpv': 3, 
		'ast': 650,
		'tcv': 2,
		'br': 50,
		'tst': 1300,
		'tbr': 1,
		'email': 'allen.d@yahoo.co.jp'
	},
	{
		'uid': 'S',
		'tag': ['大阪', '東京', '先行登録'],
		'vid': [
			{'id': 'S1', 'data': 1, 'pv': 2, 'st': 780, 'cv': 'E', 'cvn': 1, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 1, 'fid': 1, 'dd': 2, 'fd': 17, }, 
			{'id': 'S2', 'data': 7, 'pv': 1, 'st': 800, 'cv': 'E', 'cvn': 1, 'jo': 1, 'sf': 'Direct', 'sc': 'Direct', 'od': 2, 'fid': 6, 'dd': 1, 'fd': 18, },
		],
		'tvi': 2,
		'tpv': 3, 
		'ast': 790,
		'tcv': 2,
		'br': 50,
		'tst': 1580,
		'tbr': 1,
		'email': 'feiy@gmail.com'
	},
	{
		'uid': 'T',
		'tag': ['会員', '仮登録', '大阪', '東京', '先行登録', 'SVIP', 'RSS', 'VIP', '男性'],
		'vid': [
			{'id': 'T1', 'data': 1, 'pv': 20, 'st': 1200, 'cv': 'A', 'cvn': 3, 'jo': 0, 'sf': 'Google', 'sc': 'アクセス 解析', 'od': 1, 'fid': 1, 'dd': 20, 'fd': 45, }, 
			{'id': 'T2', 'data': 1, 'pv': 13, 'st': 600, 'cv': 'F', 'cvn': 1, 'jo': 0, 'sf': 'Google', 'sc': 'アクセス 解析', 'od': 2, 'fid': 0.5, 'dd': 13, 'fd': 46, },
			{'id': 'T3', 'data': 2, 'pv': 13, 'st': 1600, 'cv': 'B', 'cvn': 3, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス 解析', 'od': 3, 'fid': 1, 'dd': 13, 'fd': 47, },
			{'id': 'T4', 'data': 3, 'pv': 2, 'st': 1000, 'cv': 'C', 'cvn': 1, 'jo': 0, 'sf': 'Google', 'sc': 'twitter 足跡 解析', 'od': 4, 'fid': 1, 'dd': 2, 'fd': 48, },
			{'id': 'T5', 'data': 3, 'pv': 1, 'st': 500, 'cv': '', 'cvn': 0, 'jo': 1, 'sf': 'Yahoo', 'sc': 'twitter 足跡 解析', 'od': 5, 'fid': 0.5, 'dd': 1, 'fd': 49, },
			{'id': 'T6', 'data': 3, 'pv': 27, 'st': 1500, 'cv': 'A', 'cvn': 4, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 6, 'fid': 0.5, 'dd': 27, 'fd': 50, },
			{'id': 'T7', 'data': 4, 'pv': 2, 'st': 500, 'cv': 'E', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'アクセス解析 比較', 'od': 7, 'fid': 1, 'dd': 2, 'fd': 51, },
			{'id': 'T8', 'data': 4, 'pv': 10, 'st': 890, 'cv': 'B', 'cvn': 3, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 8, 'fid': 0.5, 'dd': 10, 'fd': 52, },
			{'id': 'T9', 'data': 5, 'pv': 12, 'st': 1200, 'cv': 'A', 'cvn': 1, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'matome.naver.jp', 'od': 9, 'fid': 1, 'dd': 12, 'fd': 53, },
			{'id': 'T10', 'data': 5, 'pv': 2, 'st': 1280, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'http://keitai-seo.jugem.jp', 'od': 10, 'fid': 0.5, 'dd': 2, 'fd': 54, },
			{'id': 'T11', 'data': 5, 'pv': 1, 'st': 150, 'cv': 'B', 'cvn': 1, 'jo': 1, 'sf': 'Direct', 'sc': 'matome.naver.jp', 'od': 11, 'fid': 0.5, 'dd': 1, 'fd': 55, },
			{'id': 'T12', 'data': 5, 'pv': 12, 'st': 530, 'cv': 'D', 'cvn': 2, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'matome.naver.jp', 'od': 12, 'fid': 0.5, 'dd': 12, 'fd': 56, },
			{'id': 'T13', 'data': 5, 'pv': 42, 'st': 1400, 'cv': 'C', 'cvn': 5, 'jo': 0, 'sf': 'matome.naver.jp', 'sc': 'matome.naver.jp', 'od': 13, 'fid': 0.5, 'dd': 42, 'fd': 57, },
			{'id': 'T14', 'data': 6, 'pv': 12, 'st': 1100, 'cv': 'B', 'cvn': 2, 'jo': 0, 'sf': 'Facebook', 'sc': 'Facebook', 'od': 14, 'fid': 1, 'dd': 12, 'fd': 58, },
			{'id': 'T15', 'data': 6, 'pv': 16, 'st': 860, 'cv': 'C', 'cvn': 2, 'jo': 0, 'sf': 'Yahoo', 'sc': 'Yahoo', 'od': 15, 'fid': 0.5, 'dd': 16, 'fd': 59, },
			{'id': 'T16', 'data': 6, 'pv': 23, 'st': 1200, 'cv': 'B', 'cvn': 3, 'jo': 0, 'sf': 'Google', 'sc': 'アクセス解析 比較', 'od': 16, 'fid': 0.5, 'dd': 23, 'fd': 60, },
			{'id': 'T17', 'data': 7, 'pv': 5, 'st': 2400, 'cv': 'B', 'cvn': 1, 'jo': 0, 'sf': 'Yahoo', 'sc': 'Yahoo', 'od': 17, 'fid': 1, 'dd': 5, 'fd': 61, },
			{'id': 'T18', 'data': 7, 'pv': 10, 'st': 1400, 'cv': '', 'cvn': 0, 'jo': 0, 'sf': 'Direct', 'sc': 'Direct', 'od': 18, 'fid': 1, 'dd': 10, 'fd': 62, },
		],
		'tvi': 18,
		'tpv': 223, 
		'ast': 1039.44444444,
		'tcv': 33,
		'br': 11.11,
		'tst': 18710,
		'tbr': 2,
		'email': 'morning@yahoo.co.jp'
	}
]


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////                              原始数据换算                             ////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 计算最大值
var vi_max = 0, //UID下最大访次
	cv_max = 0; //UID下最大转化
for( var i=0; i<data_user.length; i++ ){
	vi_max = Math.max(vi_max, data_user[i].tvi);
	cv_max = Math.max(cv_max, data_user[i].tcv);
}


/**
 * 数据清零
 */
function data_reset(){
	// 基础指标数
	uv_sum  = 0; //总uv 
	vi_sum  = 0; //总访问数
	pv_sum  = 0; //总pv
	cv_sum  = 0; //总cv
	tst_sum = 0; //总停留时间
	jo_sum  = 0; //总跳出率

	// 曲线-静态数据
	curve_uv = [{'date': 1388505600, 'days': 7, 'uv': []}]; 
    curve_vi = [{'date': 1388505600, 'days': 7, 'vi': []}]; 
    curve_pv = [{'date': 1388505600, 'days': 7, 'pv': []}];
    curve_cv = [{'date': 1388505600, 'days': 7, 'cv': []}];

	// 环图-静态数据
	// type: od-频度[a,b,c], fid-渐进度[a,b,c], dd-深度[a,b,c], fd-忠诚度[a,b,c], other-[优秀,良好,普通]
	// u - uid
	data_cycle = [
		{'type': 'od',    'data': [], 'sum': 0, 'u': [] },
		{'type': 'dd',    'data': [], 'sum': 0, 'u': [] },
		{'type': 'fid',   'data': [], 'sum': 0, 'u': [] },
		{'type': 'fd',    'data': [], 'sum': 0, 'u': [] },
		{'type': 'other', 'data': [] }
	]

	// 标签-静态数据
	data_tag = [
		{'tag': '会員',     'uv': 0, 'u': []},
		{'tag': '仮登録',   'uv': 0, 'u': []},
		{'tag': '大阪',     'uv': 0, 'u': []},
		{'tag': '女性',     'uv': 0, 'u': []},
		{'tag': '東京',     'uv': 0, 'u': []},
		{'tag': '先行登録', 'uv': 0, 'u': []},
		{'tag': 'SVIP',     'uv': 0, 'u': []},
		{'tag': 'RSS',      'uv': 0, 'u': []},
		{'tag': 'VIP',      'uv': 0, 'u': []},
		{'tag': '男性',     'uv': 0, 'u': []}
	]

	// 柱状图 - 静态数据
	// [[频度, uv]，[渐进度, uv]，[深度, uv]，[忠诚度, uv]]
	// list: cv-转化率, ast-平均停留时间, abr-跳出率;
	// type: od-频度, fid-渐进度, dd-深度, fd-忠诚度;
	// a: [具体数值, 当前条件总UV]
	data_quality = [
		{
			'list': 'cv',
			'data': [{'type':'od', 'a':[0,0], 'b':[0,0], 'c':[0,0]}, {'type':'fid', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'dd', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'fd', 'a':[0,0], 'b':[0,0], 'c':[0,0] } ]
		},
		{
			'list': 'ast',
			'data': [{'type':'od', 'a':[0,0], 'b':[0,0], 'c':[0,0]}, {'type':'fid', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'dd', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'fd', 'a':[0,0], 'b':[0,0], 'c':[0,0] } ]
		},
		{
			'list': 'abr',
			'data': [{'type':'od', 'a':[0,0], 'b':[0,0], 'c':[0,0]}, {'type':'fid', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'dd', 'a':[0,0], 'b':[0,0], 'c':[0,0] }, {'type':'fd', 'a':[0,0], 'b':[0,0], 'c':[0,0] } ]
		}
	]

	// 矩阵图 - 静态数据
	// [[B]，[A]，[D]，[C]]
	data_sort = [{'user': 0, 'tag': [] }, {'user': 0, 'tag': []}, {'user': 0, 'tag': []}, {'user': 0, 'tag': []}];


	// 转化 - 静态数据
	data_cv = [
		{'cv': 'A', 'name': '製品ページを閲覧する',       'uv': 0, 'sum': 0},
		{'cv': 'B', 'name': '会員登録',                   'uv': 0, 'sum': 0},
		{'cv': 'C', 'name': 'ブログサイトを閲覧する',     'uv': 0, 'sum': 0},
		{'cv': 'D', 'name': 'メルマガを購読する',         'uv': 0, 'sum': 0},
		{'cv': 'E', 'name': 'お問い合わせ',               'uv': 0, 'sum': 0},
		{'cv': 'F', 'name': '料金プランページを閲覧する', 'uv': 0, 'sum': 0}
	]

	// 导出 - email列表
	data_email = [];

};

/**
 * 页面数据初始化
 * 
 * @param {Array} data: 数据表
 */
function data_count(data){
	var data_init = data;
	var init_curve_uv = [0,0,0,0,0,0,0], //曲线-UV
		init_curve_vi = [0,0,0,0,0,0,0], //曲线-访问数
		init_curve_pv = [0,0,0,0,0,0,0], //曲线-PV
		init_curve_cv = [0,0,0,0,0,0,0]; //曲线-CV
	var od_a  = 0, od_b  = 0, od_c  = 0; //环图-频度
	var dd_a  = 0, dd_b  = 0, dd_c  = 0; //环图-深度
	var fid_a = 0, fid_b = 0, fid_c = 0; //环图-渐进度
	var fd_a  = 0, fd_b  = 0, fd_c  = 0; //环图-忠诚度
	// var vi_max = cv_max = 0;

	// 静态数据reset
	data_reset()

	// 循环查询
	for( var i=0; i<data_init.length; i++ ){
		if( data_init[i].tvi == 0 ){ continue; }
		var uv_l = [0,0,0,0,0,0,0];
		var od_a_l  = od_b_l = od_c_l = dd_a_l  = dd_b_l  = dd_c_l = fid_a_l = fid_b_l = fid_c_l = fd_a_l  =  fd_b_l  =  fd_c_l  = true;

		/*vi_sum  += data_init[i].tvi;
		pv_sum  += data_init[i].tpv;
		cv_sum  += data_init[i].tcv;
		tst_sum += data_init[i].tst;
		jo_sum  += data_init[i].tjo;*/
		

		// UID维度
		for( var j=0; j<data_init[i].vid.length; j++ ){
			vi_sum ++;
			pv_sum  += data_init[i].vid[j].pv;
			cv_sum  += data_init[i].vid[j].cvn;
			tst_sum += data_init[i].vid[j].st;
			jo_sum  += data_init[i].vid[j].jo;

			// 曲线 - 日期维度
			var uid_cvn = data_init[i].vid[j].cvn; //单个访次的转化次数;
			var uid_st = data_init[i].vid[j].st; //单个访次的停留时间;
			var uid_jo = data_init[i].vid[j].jo; //单个访次的跳出率;
			switch( data_init[i].vid[j].data ){
				case 1:	
					if( uv_l[0] == 0 ){ init_curve_uv[0]++; uv_l[0]++; }
					init_curve_vi[0]++; 
					init_curve_pv[0] += data_init[i].vid[j].pv;
					init_curve_cv[0] += uid_cvn;
					break;
				case 2:
					if( uv_l[1] == 0 ){ init_curve_uv[1]++; uv_l[1]++; }
					init_curve_vi[1]++;
					init_curve_pv[1] += data_init[i].vid[j].pv;
					init_curve_cv[1] += uid_cvn;
					break;
				case 3:
					if( uv_l[2] == 0 ){ init_curve_uv[2]++; uv_l[2]++; }
					init_curve_vi[2]++;
					init_curve_pv[2] += data_init[i].vid[j].pv;
					init_curve_cv[2] += uid_cvn;
					break;
				case 4:
					if( uv_l[3] == 0 ){ init_curve_uv[3]++; uv_l[3]++; }
					init_curve_vi[3]++;
					init_curve_pv[3] += data_init[i].vid[j].pv;
					init_curve_cv[3] += uid_cvn;
					break;
				case 5:
					if( uv_l[4] == 0 ){ init_curve_uv[4]++; uv_l[4]++;}
					init_curve_vi[4]++;
					init_curve_pv[4] += data_init[i].vid[j].pv;
					init_curve_cv[4] += uid_cvn;
					break;
				case 6:
					if( uv_l[5] == 0 ){ init_curve_uv[5]++; uv_l[5]++; }
					init_curve_vi[5]++;
					init_curve_pv[5] += data_init[i].vid[j].pv;
					init_curve_cv[5] += uid_cvn;
					break;
				case 7:
					if( uv_l[6] == 0 ){ init_curve_uv[6]++; uv_l[6]++; }
					init_curve_vi[6]++;
					init_curve_pv[6] += data_init[i].vid[j].pv;
					init_curve_cv[6] += uid_cvn;
					break;
			}


			// 柱状图(转化率) - 频度
			// 数据说明：1：转化率，2：平均停留时间，3：跳出率；
			if( data_init[i].vid[j].od > 5 ){
				od_a ++; // 环图 - 频度

				data_quality[0].data[0].c[1] ++;
				data_quality[1].data[0].c[1] ++;
				data_quality[2].data[0].c[1] ++;
				data_quality[0].data[0].c[0] += uid_cvn;
				data_quality[1].data[0].c[0] += uid_st;
				data_quality[2].data[0].c[0] += uid_jo;
			} else if( data_init[i].vid[j].od >= 2 && data_init[i].vid[j].od <= 5 ){
				od_b ++; // 环图 - 频度

				data_quality[0].data[0].b[1] ++;
				data_quality[1].data[0].b[1] ++;
				data_quality[2].data[0].b[1] ++;
				data_quality[0].data[0].b[0] += uid_cvn;
				data_quality[1].data[0].b[0] += uid_st;
				data_quality[2].data[0].b[0] += uid_jo;
			} else if( data_init[i].vid[j].od == 1 ){
				od_c ++; // 环图 - 频度

				data_quality[0].data[0].a[1] ++;
				data_quality[1].data[0].a[1] ++;
				data_quality[2].data[0].a[1] ++;
				data_quality[0].data[0].a[0] += uid_cvn;
				data_quality[1].data[0].a[0] += uid_st;
				data_quality[2].data[0].a[0] += uid_jo;
			}

			// 柱状图(转化率) - 深度
			// 数据说明：1：转化率，2：平均停留时间，3：跳出率；
			if( data_init[i].vid[j].dd > 5 ){
				dd_a ++; // 环图 - 深度

				data_quality[0].data[2].c[1] ++;
				data_quality[1].data[2].c[1] ++;
				data_quality[2].data[2].c[1] ++;
				data_quality[0].data[2].c[0] += uid_cvn;
				data_quality[1].data[2].c[0] += uid_st;
				data_quality[2].data[2].c[0] += uid_jo;
			} else if( data_init[i].vid[j].dd >= 2 && data_init[i].vid[j].dd <=5 ){
				dd_b ++; // 环图 - 深度

				data_quality[0].data[2].b[1] ++;
				data_quality[1].data[2].b[1] ++;
				data_quality[2].data[2].b[1] ++;
				data_quality[0].data[2].b[0] += uid_cvn;
				data_quality[1].data[2].b[0] += uid_st;
				data_quality[2].data[2].b[0] += uid_jo;
			} else if( data_init[i].vid[j].dd == 1 ){
				dd_c ++; // 环图 - 深度

				data_quality[0].data[2].a[1] ++;
				data_quality[1].data[2].a[1] ++;
				data_quality[2].data[2].a[1] ++;
				data_quality[0].data[2].a[0] += uid_cvn;
				data_quality[1].data[2].a[0] += uid_st;
				data_quality[2].data[2].a[0] += uid_jo;
			}

			// 柱状图(转化率) - 渐进度
			// 数据说明：1：转化率，2：平均停留时间，3：跳出率；
			if( data_init[i].vid[j].fid > 5 ){
				fid_c ++; // 环图 - 渐进度

				data_quality[0].data[1].a[1] ++;
				data_quality[1].data[1].a[1] ++;
				data_quality[2].data[1].a[1] ++;
				data_quality[0].data[1].a[0] += uid_cvn;
				data_quality[1].data[1].a[0] += uid_st;
				data_quality[2].data[1].a[0] += uid_jo;
			}  else if( data_init[i].vid[j].fid >= 1 && data_init[i].vid[j].fid <=5 ){
				fid_b ++; // 环图 - 渐进度

				data_quality[0].data[1].b[1] ++;
				data_quality[1].data[1].b[1] ++;
				data_quality[2].data[1].b[1] ++;
				data_quality[0].data[1].b[0] += uid_cvn;
				data_quality[1].data[1].b[0] += uid_st;
				data_quality[2].data[1].b[0] += uid_jo;
			} else if( data_init[i].vid[j].fid < 1 ){
				fid_a ++; // 环图 - 渐进度

				data_quality[0].data[1].c[1] ++;
				data_quality[1].data[1].c[1] ++;
				data_quality[2].data[1].c[1] ++;
				data_quality[0].data[1].c[0] += uid_cvn;
				data_quality[1].data[1].c[0] += uid_st;
				data_quality[2].data[1].c[0] += uid_jo;
			} 

			// 柱状图(转化率) - 忠诚度
			// 数据说明：1：转化率，2：平均停留时间，3：跳出率；
			if( data_init[i].vid[j].fd > 5 ){
				fd_a ++; // 环图 - 忠诚度

				data_quality[0].data[3].c[1] ++;
				data_quality[1].data[3].c[1] ++;
				data_quality[2].data[3].c[1] ++;
				data_quality[0].data[3].c[0] += uid_cvn;
				data_quality[1].data[3].c[0] += uid_st;
				data_quality[2].data[3].c[0] += uid_jo;
			} else if( data_init[i].vid[j].fd >= 2 && data_init[i].vid[j].fd <=5 ){
				fd_b ++; // 环图 - 忠诚度

				data_quality[0].data[3].b[1] ++;
				data_quality[1].data[3].b[1] ++;
				data_quality[2].data[3].b[1] ++;
				data_quality[0].data[3].b[0] += uid_cvn;
				data_quality[1].data[3].b[0] += uid_st;
				data_quality[2].data[3].b[0] += uid_jo;
			} else if( data_init[i].vid[j].fd == 1 ){
				fd_c ++; // 环图 - 忠诚度

				data_quality[0].data[3].a[1] ++;
				data_quality[1].data[3].a[1] ++;
				data_quality[2].data[3].a[1] ++;
				data_quality[0].data[3].a[0] += uid_cvn;
				data_quality[1].data[3].a[0] += uid_st;
				data_quality[2].data[3].a[0] += uid_jo;
			}

			// 统计cv数
			if( data_init[i].vid[j].cvn != 0 ){
				for( var k=0; k<data_cv.length; k++ ){
					if( data_init[i].vid[j].cv == data_cv[k].cv ){
						data_cv[k].sum += parseInt(data_init[i].vid[j].cvn);
						break;
					}
				}
			}
		};//UID维度

		// 访次非0
		if( data_init[i].tvi != 0 ){
			// 统计uv
			uv_sum ++;

			// 统计email
			data_email.push(data_init[i].email)

			// 初始化 - 标签列表
			for( var j=0; j<data_init[i].tag.length; j++ ){
				for( var k=0; k<data_tag.length; k++ ){
					if( data_init[i].tag[j] == data_tag[k].tag ){
						data_tag[k].uv ++;
						data_tag[k].u.push(data_init[i].uid);
						continue;
					}
				}
			};//TAG 维度
		}
	}

	//初始化 - 曲线数据
	// UU
	curve_uv[0].uv = [];
	curve_uv[0].uv = curve_uv[0].uv.concat(init_curve_uv)
	// 访问数
	curve_vi[0].vi = [];
	curve_vi[0].vi = curve_vi[0].vi.concat(init_curve_vi)
	// PV
	curve_pv[0].pv = [];
	curve_pv[0].pv = curve_pv[0].pv.concat(init_curve_pv)
	// CV
	curve_cv[0].cv = [];
	curve_cv[0].cv = curve_cv[0].cv.concat(init_curve_cv)

	//初始化 - 基础指标数据
	uv_sum = uv_sum <= 0 ? 0 : uv_sum;
	vi_sum = vi_sum <= 0 ? 0 : vi_sum;
	pv_sum = pv_sum <= 0 ? 0 : pv_sum;
	cv_sum = cv_sum <= 0 ? 0 : cv_sum;
	$('#basic_uv').text(uv_sum)
	$('#basic_vi').text(vi_sum)
	$('#basic_pv').text(pv_sum)
	$('#basic_cv').text(cv_sum)

	// 初始化 - 环图数据
	// 频度
	var od_sum = od_a + od_b + od_c;
	data_cycle[0].sum = od_sum;
	// data_cycle[0].data.push((vi_sum == 0 ? 0 : od_a/vi_sum*100), (vi_sum == 0 ? 0 : od_b/vi_sum*100), (vi_sum == 0 ? 0 : od_c/vi_sum*100) );
	data_cycle[0].data.push((od_sum == 0 ? 0 : od_a/od_sum*100), (od_sum == 0 ? 0 : od_b/od_sum*100), (od_sum == 0 ? 0 : od_c/od_sum*100) );
	data_cycle[0].u.push(od_a, od_b, od_c);
	// 深度
	var dd_sum = dd_a + dd_b + dd_c;
	data_cycle[1].sum = dd_sum;
	// data_cycle[1].data.push((vi_sum == 0 ? 0 : dd_a/vi_sum*100), (vi_sum == 0 ? 0 : dd_b/vi_sum*100), (vi_sum == 0 ? 0 : dd_c/vi_sum*100) );
	data_cycle[1].data.push((dd_sum == 0 ? 0 : dd_a/dd_sum*100), (dd_sum == 0 ? 0 : dd_b/dd_sum*100), (dd_sum == 0 ? 0 : dd_c/dd_sum*100) );
	data_cycle[1].u.push(dd_a, dd_b, dd_c);
	// 渐进度
	var fid_sum = fid_a + fid_b + fid_c;
	data_cycle[2].sum = fid_sum;
	// data_cycle[2].data.push((vi_sum == 0 ? 0 : fid_a/vi_sum*100), (vi_sum == 0 ? 0 : fid_b/vi_sum*100), (vi_sum == 0 ? 0 : fid_c/vi_sum*100) );
	data_cycle[2].data.push((fid_sum == 0 ? 0 : fid_a/fid_sum*100), (fid_sum == 0 ? 0 : fid_b/fid_sum*100), (fid_sum == 0 ? 0 : fid_c/fid_sum*100) );
	data_cycle[2].u.push(fid_a, fid_b, fid_c);
	// 忠诚度
	var fd_sum = fd_a + fd_b + fd_c;
	data_cycle[3].sum = fd_sum;
	// data_cycle[3].data.push((vi_sum == 0 ? 0 : fd_a/vi_sum*100), (vi_sum == 0 ? 0 : fd_b/vi_sum*100), (vi_sum == 0 ? 0 : fd_c/vi_sum*100) );
	data_cycle[3].data.push((fd_sum == 0 ? 0 : fd_a/fd_sum*100), (fd_sum == 0 ? 0 : fd_b/fd_sum*100), (fd_sum == 0 ? 0 : fd_c/fd_sum*100) );
	data_cycle[3].u.push(fd_a, fd_b, fd_c);
	// 优秀
	// var data_cycle_a_sum = ((od_a+dd_a+fid_a+fd_a)/vi_sum*100/400*100).toFixed(2);
	/*var data_cycle_a_sum = ((od_a+dd_a+fid_a+fd_a)/vi_sum*100/400*100).toFixed(2);
	var data_cycle_b_sum = ((od_b+dd_b+fid_b+fd_b)/vi_sum*100/400*100).toFixed(2);
	var data_cycle_c_sum = ((od_c+dd_c+fid_c+fd_c)/vi_sum*100/400*100).toFixed(2);*/
	var data_sum = od_sum+dd_sum+fid_sum+fd_sum;
	var data_cycle_a_sum = ((od_a+dd_a+fid_a+fd_a)/data_sum*100).toFixed(2);
	var data_cycle_b_sum = ((od_b+dd_b+fid_b+fd_b)/data_sum*100).toFixed(2);
	var data_cycle_c_sum = ((od_c+dd_c+fid_c+fd_c)/data_sum*100).toFixed(2);

	data_cycle[4].data.push( data_sum == 0 ? 0 : data_cycle_a_sum, data_sum == 0 ? 0 : data_cycle_b_sum, data_sum == 0 ? 0 : data_cycle_c_sum )

	// 初始化 - 矩阵图
	for( var i=0; i<data_init.length; i++ ){
		if( data_init[i].tvi != 0 ){
			var user_vi = data_init[i].tvi == 0 ? 0 : data_init[i].tvi / vi_max *100;
			var user_cv = data_init[i].tcv == 0 ? 0 : data_init[i].tcv / cv_max *100;

			if( user_vi >= 20 && user_cv >= 20 ){
				data_sort[1].user ++;
				data_sort[1].tag = data_sort[1].tag.concat(data_init[i].tag)
			} else if( user_vi < 20 && user_cv >= 20 ){
				data_sort[0].user ++;
				data_sort[0].tag = data_sort[0].tag.concat(data_init[i].tag)
			} else if( user_vi >= 20 && user_cv < 20 ){
				data_sort[3].user ++;
				data_sort[3].tag = data_sort[3].tag.concat(data_init[i].tag)
			} else if( user_vi < 20 && user_cv < 20 ){
				data_sort[2].user ++;
				data_sort[2].tag = data_sort[2].tag.concat(data_init[i].tag)
			}
		};
	}
	// 去重(矩阵图)
	for( var i=0; i<data_sort.length; i++ ){
		var tmp = data_sort[i].tag.unique();
		data_sort[i].tag = [];
		data_sort[i].tag = data_sort[i].tag.concat(tmp)
	}
	
	// =20.0 过滤器
	// filter_init();
	
	// =20.1 曲线
	curve_init();

	// =20.2 环图
	cycle_init();

	// =20.3 柱状图
	histogram_init();

	// =20.4 标签列表
	tag_init();
	
	// =20.5 矩阵图
	matrix_init();
	
	// =20.6 CV
	eventWindowLoaded(data_tag, data_cv, data_init);
};//data_count




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////                              过滤器                                   ////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 遍历已生成的过滤器
 */
function fliter_uniqe(target){
	var f_length = $('.sub_nav').find('ul > li').not('.nav_clear').length;
	var flag = false;
	for( var i=0; i<f_length; i++ ){
		if(  $(target).attr('data-title') == $('.sub_nav').find('ul > li').eq(i).find('span').text() ){
			flag = i;
			break;
		}
	}
	return flag;
}; //fliter_uniqe


/**
 * 过滤器事件绑定
 */
function filter_event(){	
	// 环图
	$('.cycle_graph_list').find('a').bind('click', function(){
		var flag = fliter_uniqe($(this));

		if( typeof(flag) == 'boolean' ){
			add_filter($(this), 'choice');
		} else {
			del_filter(flag)
		}
		return false;
	})

	// 柱状图
	$('.quality_list').find('a').bind('click', function(){
		var flag = fliter_uniqe($(this));

		if( typeof(flag) == 'boolean' ){
			add_filter($(this), 'quality');
		} else {
			del_filter(flag)
		}
		return false;
	})

	// 标签列表
	$('.inside_box').find('p > a').live('click', function(){
		var flag = fliter_uniqe($(this));

		if( typeof(flag) == 'boolean' ){
			add_filter($(this), 'mark');
		} else {
			del_filter(flag)
		}
	})

	// 矩阵图 - 百分比条形图
	$('.sort').find('p > a').bind('click', function(){
		var flag = fliter_uniqe($(this));

		if( typeof(flag) == 'boolean' ){
			if( $(this).attr('data-filter') == 'sort=b' ){
				$('.sort_box').eq(0).find('.btn-filter').addClass('active');
			} else if( $(this).attr('data-filter') == 'sort=a' ){
				$('.sort_box').eq(1).find('.btn-filter').addClass('active');
			} else if( $(this).attr('data-filter') == 'sort=d' ){
				$('.sort_box').eq(2).find('.btn-filter').addClass('active');
			} else if( $(this).attr('data-filter') == 'sort=c' ){
				$('.sort_box').eq(3).find('.btn-filter').addClass('active');
			}

			add_filter($(this), 'sort_b');
		} else {
			if( $(this).attr('data-filter') == 'sort=a' || $(this).attr('data-filter') == 'sort=b' || $(this).attr('data-filter') == 'sort=c' || $(this).attr('data-filter') == 'sort=d' ){
				$('.sort_box').find('.btn-filter').removeClass('active');
			}
			del_filter(flag)
		}
		return false;
	})

	// 矩阵图 - 标签
	$('.sort_box').find('div > a').live('click', function(){
		var flag = fliter_uniqe($(this));

		if( typeof(flag) == 'boolean' ){
			add_filter($(this), 'sort_a');
		} else {
			del_filter(flag)
		}
	})

	// 矩阵图 - 过滤器图标
	$('.sort_box').find('.btn-filter').bind('click', function(){
		var flag = fliter_uniqe($(this));
		$(this).toggleClass('active');

		if( typeof(flag) == 'boolean' ){
			add_filter($(this), 'sort_b');
		} else {
			del_filter(flag)
		}
		return false;
	})
}; //filter_event


/**
 * 生成过滤器标签
 * @param {Object} target 点击的elem对象
 * @param {String} area   过滤区块
 */
function add_filter(target, area){
	// 生成过滤器标签
	var elem = $(target)
	var f_name = elem.attr('data-title')
	var li = $('<li><span>'+f_name+'</span><a data-filter="'+elem.attr('data-filter')+'" data-area="'+area+'">close</a></li>')
 	$('.nav_clear').eq(0).before(li);

 	// 过滤数据
 	filter();

 	// 页面自适应
 	sizeResp();
}; //add_filter


/**
 * 删除过滤器标签
 * @param {Number} index 删除标签索引
 */
function del_filter(index){
	// 删除标签
	$('.sub_nav').find('ul > li').eq(index).remove();

	// 过滤数据
	filter();

	// 页面自适应
	sizeResp();
}; //del_filter


/**
 * 过滤数据
 * @param {String} con  过滤器条件
 * @param {String} val  过滤器值
 * @param {String} area 过滤区块
 */
var data_filter = [];
data_filter = jQuery.extend(true, [], data_user);

function filter(){
	var f_length = $('.sub_nav').find('ul > li').not('.nav_clear').length;

	if( f_length == 0 ){
		data_count(data_user);
	} else {
		for( var i=0; i<f_length; i++ ){
			var elem = $('.sub_nav').find('ul > li').eq(i).find('a');
			var con = elem.attr('data-filter').slice(0, elem.attr('data-filter').indexOf('='));
			var val = elem.attr('data-filter').slice(elem.attr('data-filter').indexOf('=')+1);
			var area = elem.attr('data-area');

			var uid_del_list = [];
			for( var j=0; j<data_filter.length; j++ ){

				if( area == 'choice' || area == 'quality' ){
		 			// 环图 & 柱状图
					var vid_del_list = [];

					for( var k=0; k<data_filter[j].vid.length; k++ ){
						var flag = false;
						if( con == 'od') {
							if( val == 'a' && data_filter[j].vid[k].od <= 5 || val == 'b' && data_filter[j].vid[k].od > 5 || val == 'b' && data_filter[j].vid[k].od < 2 || val == 'c' && data_filter[j].vid[k].od != 1 ){
								flag = true;
							}
						} else if( con == 'fid') {
							if( val == 'a' && data_filter[j].vid[k].fid >= 1 || val == 'b' && data_filter[j].vid[k].fid > 5 || val == 'b' && data_filter[j].vid[k].fid < 1 || val == 'c' && data_filter[j].vid[k].fid <= 5 ){
								flag = true;
							}
						} else if( con == 'dd') {
							if( val == 'a' && data_filter[j].vid[k].dd <= 5 || val == 'b' && data_filter[j].vid[k].dd > 5 || val == 'b' && data_filter[j].vid[k].dd < 2 || val == 'c' && data_filter[j].vid[k].dd != 1 ){
								flag = true;
							}
						} else if( con == 'fd') {
							if( val == 'a' && data_filter[j].vid[k].fd <= 5 || val == 'b' && data_filter[j].vid[k].fd > 5 || val == 'b' && data_filter[j].vid[k].fd < 2 || val == 'c' && data_filter[j].vid[k].fd != 1 ){
								flag = true;
							}
						};

						if( flag ){
							/*data_filter[j].tvi --;
							data_filter[j].tpv -= data_filter[j].vid[k].pv;
							data_filter[j].tcv -= data_filter[j].vid[k].cvn;
							data_filter[j].tst -= data_filter[j].vid[k].st;

							data_filter[j].tvi = data_filter[j].tvi <=0 ? 0 : data_filter[j].tvi;
							data_filter[j].tpv = data_filter[j].tpv <= 0 ? 0 : data_filter[j].tpv;
							data_filter[j].tcv = data_filter[j].tcv <= 0 ? 0 : data_filter[j].tcv;
							data_filter[j].tst = data_filter[j].tst <= 0 ? 0 : data_filter[j].tst;*/
							// data_filter[j].vid.splice(k, 1);
							vid_del_list.push(k);
						}
					}

					if( vid_del_list.length == data_filter[j].vid.length ){
						uid_del_list.push(j);
					} else {
						for( var l=0; l<vid_del_list.length; l++ ){
							var index = vid_del_list.length-1-l;
							data_filter[j].vid.splice(vid_del_list[index], 1);
						}
					}
				} else if( area == 'mark' ){
					// 标签
					if( !isCon(data_filter[j].tag, val) ){
						// data_filter.splice(j, 1);
						uid_del_list.push(j);
					}
				} else if( area == 'sort_a' || area == 'sort_b' ){
					// 矩阵图
					var user_vi = data_filter[j].tvi == 0 ? 0 : data_filter[j].tvi / vi_max *100;
					var user_cv = data_filter[j].tcv == 0 ? 0 : data_filter[j].tcv / cv_max *100;
					var flag = false;

					if( area == 'sort_a' ){
						// 矩阵图-标签
						if( con == 1 ){
							if( !isCon(data_filter[j].tag, val) || user_vi < 20 || user_cv < 20 ){ flag = true; } 
						} else if( con == 0 ){
							if( !isCon(data_filter[j].tag, val) || user_vi >= 20 || user_cv < 20 ){ flag = true; } 
						} else if( con == 3 ){
							if( !isCon(data_filter[j].tag, val) || user_vi < 20 || user_cv >= 20 ){ flag = true; } 
						} else if( con == 2 ){
							if( !isCon(data_filter[j].tag, val) || user_vi >= 20 || user_cv >= 20 ){ flag = true; } 
						}
					} else {
						// 矩阵图-过滤器图标
						if( val == 'a' ){
							if( user_vi < 20 || user_cv < 20 ){ flag = true; } 
						} else if( val == 'b' ){
							if( user_vi >= 20 || user_cv < 20 ){ flag = true; } 
						} else if( val == 'c' ){
							if( user_vi < 20 || user_cv >= 20 ){ flag = true; }
						} else if( val == 'd' ){
							if( user_vi >= 20 || user_cv >= 20 ){ flag = true; } 
						}
					}

					if( flag ){
						// data_filter.splice(j, 1);
						uid_del_list.push(j);
					}
				}
			}

			for( var j=0; j<uid_del_list.length; j++ ){
				var index = uid_del_list.length-1-j;
				data_filter.splice(uid_del_list[index], 1);
			}
		}
		// 过滤器数据
		data_count(data_filter);

		// 重置过滤器数组表
		data_filter = [];
		data_filter = jQuery.extend(true, [], data_user);
	}
}; //filter