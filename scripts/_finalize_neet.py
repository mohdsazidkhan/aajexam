"""Finalize a NEET/AIPMT Oswaal paper: render question/figure crops and set the
image + option fields. Year-parameterized; per-year config below.

Two image modes (rest of the paper stays plain text):
  * BLOCK  — full question block (stem+options+figure) rendered; options carry
             visual content (fractions, chem structures, overlines, table rows,
             graph choices) -> option buttons become (A)-(D) labels.
  * FIGURE — only the diagram rendered; clean text options kept.
Cross-column / cross-page questions get hand-verified MANUAL crop rects. A MANUAL
value may be a single (page,[x0,y0,x1,y1]) OR a list of them -> the crops are
stacked vertically into one composite image (for options split across columns/
pages). Oswaal content pages carry no watermark, so crops render as-is.

Usage: _finalize_neet.py <pdf> <year> <in-json> <out-json> <extract-dir> [--qa]
"""
import sys, os, json, fitz
from PIL import Image, ImageDraw

pdf, key = sys.argv[1], sys.argv[2]      # key: '2013','2014','2015p1','2015p2',...
in_json, out_json, extract_dir = sys.argv[3:6]
QA = '--qa' in sys.argv
DPI = 200
os.makedirs(extract_dir, exist_ok=True)
doc = fitz.open(pdf)

CONFIG = {
    '2013': {
        'block': (set(range(1, 46)) - {4}) | {52, 65, 74, 79, 81, 86, 87, 88, 89}
                 | {136, 147, 154, 158},
        'figure': {4, 108, 143, 146, 149, 150, 151, 152, 155, 156},
        'manual': {
            4:   (0, [400, 300, 512, 402]),
            8:   (1, [38, 53, 298, 193]),
            108: (7, [66, 578, 314, 646]),
            136: (8, [58, 556, 556, 660]),
            149: (10, [95, 60, 352, 222]),
            156: (11, [338, 60, 516, 200]),
            158: (11, [58, 397, 556, 510]),
        },
    },
    '2014': {
        'block': set(range(1, 46)) | {49, 60, 76, 78, 80, 84, 85, 88, 89}
                 | {107, 132, 153, 168, 177, 178},
        'figure': {172},
        'manual': {   # columns: L=[38,300], R=[308,567]
            8:  [(0, [308, 588, 567, 785]), (1, [38, 60, 300, 258])],    # graph opts pg0->1
            76: [(5, [38, 668, 300, 782]), (5, [308, 58, 567, 228])],    # struct opts cross-col
            80: [(5, [308, 655, 567, 785]), (6, [38, 58, 300, 180])],    # polymer opts pg5->6
            84: (6, [38, 358, 300, 742]),                                # tall left-col structures
        },
    },
    '2015p1': {
        'block': set(range(1, 46)) | {60, 71, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89}
                 | {91, 98, 138, 145, 172},
        'figure': {177},
        'manual': {   # columns: L=[38,300], R=[308,567]
            44:  (4, [38, 62, 300, 212]),                                # fig+graph opts pg4-left
            83:  (6, [308, 60, 567, 232]),                               # structures in right col
            87:  [(6, [308, 625, 567, 760]), (7, [38, 58, 300, 216])],   # structs pg6-R -> pg7-L
            138: (9, [308, 58, 567, 300]),                               # class table (cross-col)
            145: [(9, [308, 665, 567, 796]), (10, [38, 58, 300, 290])],  # table pg9-R -> pg10-L
            177: (11, [308, 598, 567, 748]),                             # population graph
        },
    },
    '2015p2': {
        'block': set(range(1, 46)) | {47, 49, 51, 53, 81, 83, 89}
                 | {99, 130, 167},
        'figure': {125},
        'manual': {   # columns: L=[38,300], R=[308,567]
            47: [(3, [38, 655, 300, 748]), (3, [308, 597, 567, 796])],  # ester opts split cols
            89: [(6, [38, 165, 300, 250]), (6, [308, 58, 567, 138])],   # reaction reactants|product
            99: (6, [308, 260, 567, 450]),                              # column table (cross-col)
        },
    },
    '2016p1': {
        'block': set(range(1, 46)) | {50, 52, 57, 60, 73, 78, 86, 87}
                 | {117, 118, 142, 145, 172},
        'figure': set(),
        'manual': {   # columns: L=[38,300], R=[308,567]
            50:  [(3, [38, 700, 300, 752]), (3, [308, 345, 567, 475])], # reactions i | ii,iii
            87:  [(6, [38, 300, 300, 448]), (6, [308, 60, 567, 235])],  # biphenyls a,b | c,d
            117: (7, [95, 650, 560, 748]),                              # full-width microbe table
            145: [(9, [38, 558, 300, 796]), (9, [308, 58, 567, 122])],  # table+code(a) | codes b,c,d
        },
    },
    '2021': {   # 200-Q format (Physics 1-50, Chemistry 51-100, Botany 101-150, Zoology 151-200)
        'block': set(range(1, 51)) | {60, 73, 75, 76, 87, 88, 92, 94, 96, 100}
                 | {105, 108, 116, 119, 124, 134, 145, 146, 149, 150, 155, 158, 161, 171, 189, 190, 194, 198},
        'figure': set(),
        'manual': {   # columns: L=[38,301], R=[308,584]
            19:  [(1, [308, 621, 584, 736]), (2, [38, 62, 301, 108])],   # dipole stem+fig R-bot pg1 | opts L-top pg2
            26:  [(2, [38, 681, 301, 741]), (2, [308, 64, 584, 205])],   # stem L-bot pg2 | B-r graphs a-d R-top pg2
            33:  [(2, [308, 699, 584, 738]), (3, [38, 62, 301, 98])],    # stem R-bot pg2 | opts L-top pg3
            37:  [(3, [38, 557, 301, 741]), (3, [308, 62, 584, 108])],   # lens stem+fig+opt(a) L pg3 | opts b,c,d R-top pg3
            124: [(10, [38, 614, 301, 720]), (10, [308, 64, 584, 213])], # table a,b L-bot pg10 | c,d rows+codes R-top pg10
            145: [(11, [308, 614, 584, 730]), (12, [38, 64, 301, 136])], # table R-bot pg11 | codes L-top pg12
            190: [(15, [38, 604, 301, 733]), (15, [308, 64, 584, 136])], # table L-bot pg15 | codes R-top pg15
            198: [(16, [38, 264, 301, 388]), (16, [308, 64, 584, 136])], # table L pg16 | codes R-top pg16
        },
    },
    '2022': {   # 200-Q format; NUMERIC options (1)-(4). 4th Sep 2022 (Re-Exam).
        'block': set(range(1, 51))
                 | {56, 57, 61, 63, 75, 77, 78, 84, 85, 90, 91, 93, 95, 96, 100}
                 | {105, 106, 107, 115, 120, 123, 137, 139, 140, 148, 149}
                 | {160, 169, 173, 190, 199},
        'figure': {69, 142},
        'manual': {   # columns: L=[38,301], R=[308,584]
            15:  [(1, [308, 705, 584, 736]), (2, [38, 62, 301, 124])],   # stem R-bot pg1 | cont+opts L-top pg2
            19:  [(2, [38, 435, 301, 735]), (2, [308, 62, 584, 288])],   # stem+graphs 1,2 L pg2 | graphs 3,4 R-top pg2
            29:  [(3, [38, 544, 301, 700]), (3, [308, 62, 584, 262])],   # table a,b L-bot pg3 | c,d rows+codes R-top pg3
            41:  (4, [316, 322, 584, 626]),                              # position-time graphs 1-4 (clean R-col pg4)
            77:  [(8, [38, 523, 301, 735]), (8, [308, 62, 584, 372])],   # rxn stem+opt1 L pg8 | opts 2,3,4 R-top pg8
            96:  [(10, [308, 606, 584, 692]), (11, [38, 62, 301, 442])], # rxn stem R-bot pg10 | opts 1-4 L-top pg11
            105: [(11, [308, 673, 584, 735]), (12, [38, 62, 301, 184])], # table a,b R-bot pg11 | c,d rows+codes L-top pg12
        },
    },
    '2025': {   # 180-Q (reverted: Physics 45/Chem 45/Bio 90); 'Q. N.' markers, NUMERIC opts, 3-booklet PDF.
        'block': set(range(1, 46))
                 | {46, 48, 59, 60, 64, 65, 66, 69, 72, 77, 80, 83}
                 | {101, 110, 115, 121, 122, 134, 137, 141, 148, 162, 164, 178},
        'figure': set(),
        'whiten': True,             # source PDF has a faint full-page watermark
        'manual': {   # columns: L=[38,301], R=[308,584]
            24:  [(2, [308, 584, 584, 738]), (3, [38, 62, 301, 120])],   # balloon stem+opts 1,2 R-bot pg2 | opts 3,4 L-top pg3
            48:  [(14, [38, 630, 301, 740]), (14, [308, 398, 584, 478])],# match table L-bot pg14 | codes R-mid pg14 (after booklet preamble)
            65:  [(16, [38, 528, 301, 739]), (16, [308, 62, 584, 221])], # energy diagrams 1,2 L-bot pg16 | diagrams 3,4 R-top pg16
            122: [(31, [38, 594, 301, 736]), (31, [308, 62, 584, 92])],  # match table+codes 1,2 L-bot pg31 | codes 3,4 R-top pg31
        },
    },
    '2024': {   # 200-Q; 'Q. N.' markers + NUMERIC opts + table key; 05th May 2024.
        'block': set(range(1, 51))
                 | {51, 52, 55, 61, 64, 69, 70, 73, 76, 78, 82, 86}
                 | {101, 104, 111, 115, 117, 123, 125, 136, 138, 142, 143, 144, 149, 150}
                 | {151, 157, 159, 160, 162, 163, 165, 167, 170, 173, 174, 177, 178, 180,
                    182, 187, 188, 191, 192, 194, 195},
        'figure': {139},
        'manual': {   # columns: L=[38,301], R=[308,584]; stem+opt1 | remaining opts overflow
            3: [(0, [38, 698, 301, 742]), (0, [308, 515, 584, 632])],
            5: [(0, [308, 692, 584, 742]), (1, [38, 62, 301, 113])],
            12: [(1, [38, 701, 301, 740]), (1, [308, 62, 584, 102])],
            17: [(1, [308, 689, 584, 739]), (2, [38, 62, 301, 139])],
            22: [(2, [38, 675, 301, 744]), (2, [308, 62, 584, 145])],
            27: [(2, [308, 711, 584, 740]), (3, [38, 62, 301, 122])],
            33: [(3, [38, 620, 301, 737]), (3, [308, 62, 584, 273])],
            37: [(3, [308, 690, 584, 743]), (4, [38, 62, 301, 123])],
            43: [(4, [38, 512, 301, 719]), (4, [308, 62, 584, 358])],
            46: [(4, [308, 536, 584, 738]), (5, [38, 62, 301, 239])],
            48: [(5, [38, 320, 301, 385]), (5, [308, 62, 584, 143])],
            52: [(5, [38, 635, 301, 738]), (5, [308, 62, 584, 143])],
            55: [(6, [38, 118, 301, 388]), (6, [308, 62, 584, 390])],
            82: [(8, [308, 611, 584, 736]), (9, [38, 62, 301, 144])],
            86: [(9, [38, 437, 301, 639]), (9, [308, 62, 584, 178])],
            117: [(11, [308, 550, 584, 736]), (12, [38, 62, 301, 91])],
            123: [(12, [38, 645, 301, 738]), (12, [308, 62, 584, 120])],
            143: [(14, [38, 619, 301, 737]), (14, [308, 62, 584, 137])],
            167: [(16, [308, 644, 584, 737]), (17, [38, 62, 301, 135])],
            180: [(18, [38, 560, 301, 740]), (18, [308, 62, 584, 101])],
        },
    },
    '2023': {   # 200-Q; NUMERIC options. 07th May 2023. Match-lists use 'A./B.' + 'A-I,B-II' code opts.
        'block': set(range(1, 51))
                 | {53, 55, 57, 67, 74, 78, 79, 81, 86, 87, 88, 89, 91, 94, 100}
                 | {108, 136, 141, 143, 144, 149, 150}
                 | {154, 162, 167, 168, 169, 172, 173, 177, 180, 182, 183, 185, 187, 194},
        'figure': set(),
        'manual': {   # columns: L=[38,301], R=[308,584]
            42:  [(3, [38, 603, 301, 735]), (3, [308, 62, 584, 96])],    # SHM graph+opts 1,2 L pg3 | opts 3,4 R-top pg3
            48:  [(3, [308, 694, 584, 733]), (4, [38, 62, 301, 92])],    # stem R-bot pg3 | opts L-top pg4
            49:  [(4, [38, 89, 301, 218]), (4, [308, 62, 584, 96])],     # dipole stem+fig+opts 1,2 L pg4 | opts 3,4 R-top pg4
            50:  (4, [308, 95, 584, 235]),                               # bullet stem+text opts (clean R-col pg4; parser mis-grabbed Q55 graphs)
            55:  [(4, [38, 654, 301, 692]), (4, [308, 315, 584, 742])],  # Boyle stem L-bot pg4 | 4 graph opts R-col pg4
            81:  [(7, [38, 675, 301, 742]), (7, [308, 62, 584, 123])],   # neoprene stem+opt1 L-bot pg7 | opts 2,3,4 R-top pg7
            86:  [(7, [308, 668, 584, 742]), (8, [38, 62, 301, 228])],   # match table A row R-bot pg7 | B-D+codes L-top pg8
            91:  [(8, [38, 670, 301, 742]), (8, [308, 62, 584, 222])],   # dehydration stem+opt1 L-bot pg8 | opts 2,3,4 R-top pg8
            169: [(15, [38, 649, 301, 742]), (15, [308, 62, 584, 248])], # eye match A row L-bot pg15 | B-D+codes R-top pg15
        },
    },
    '2020p2': {  # Phase II. Match-list heavy; all Column-I/II imaged. Physics all in-column (no composites needed)
        'block': set(range(1, 46)) | {47, 51, 52, 56, 59, 60, 63, 65, 69, 70, 72, 75, 79, 80, 81, 104}
                 | {109, 111, 126, 134, 143, 145, 148, 150, 153, 158, 166, 172, 173, 175, 176, 180},
        'figure': set(),
        'manual': {   # columns: L=[38,301], R=[308,584]
            59:  [(3, [308, 631, 584, 744]), (4, [38, 62, 301, 160])],   # phenol stem+opts a,b R-bot pg3 | opts c,d L-top pg4
            63:  [(4, [38, 476, 301, 742]), (4, [308, 62, 584, 98])],    # aspects table+code(a) L-bot pg4 | codes b,c,d R-top pg4
            126: [(7, [308, 570, 584, 740]), (8, [38, 62, 301, 119])],   # table R-bot pg7 | codes L-top pg8
            175: [(11, [38, 598, 301, 748]), (11, [308, 62, 584, 108])], # cell-cycle table L-bot pg11 | codes R-top pg11
        },
    },
    '2020p1': {  # Phase I. Very match-list heavy; all Column-I/II (bordered+inline) imaged (parser mangles roman-marker opts)
        'block': set(range(1, 46)) | {57, 66, 71, 81, 82, 85, 87, 88}
                 | {93, 113, 115, 125, 128, 139, 142, 143, 151, 152, 157, 159, 162, 177, 178},
        'figure': set(),
        'manual': {   # columns: L=[38,301], R=[308,584]
            7:   [(0, [38, 686, 301, 747]), (0, [308, 282, 584, 299])],  # stem L-bot pg0 | opts (1 line) R-top pg0 (cover offset)
            32:  [(1, [308, 642, 584, 738]), (2, [38, 62, 301, 130])],   # stem+graphs a,b R-bot pg1 | graphs c,d L-top pg2
            87:  [(5, [38, 271, 301, 378]), (5, [330, 14, 560, 80])],    # anisole stem+opts a,b L pg5 (pre-BIOLOGY banner) | opts c,d R-top pg5
            142: [(8, [38, 656, 301, 727]), (8, [308, 62, 584, 214])],   # col-I(A) L-bot pg8 | rows B-D+codes R-top pg8
            178: [(10, [308, 672, 584, 717]), (11, [38, 62, 301, 198])], # stem+header R-bot pg10 | table body+codes L-top pg11
        },
    },
    '2019': {   # right col extends to x=584; bordered match tables imaged, inline match-lists kept as text
        'block': set(range(1, 46)) | {47, 48, 49, 53, 71, 72, 73, 81, 82, 84, 86}
                 | {97, 105, 107, 116, 124, 131, 157, 174},
        'figure': {46},
        'manual': {   # columns: L=[38,301], R=[308,584]
            26:  [(1, [308, 588, 584, 741]), (2, [38, 88, 301, 345])],   # stem+opt(a) graph R-bot pg1 | opts b,c,d graphs L-top pg2
            36:  [(2, [308, 705, 584, 744]), (3, [38, 78, 301, 206])],   # stem R-bot pg2 | PQR triangle+opts L-top pg3
            39:  [(3, [38, 535, 301, 570]), (3, [308, 62, 584, 106])],   # stem L pg3 | cont+opts R-top pg3
            46:  (3, [70, 598, 301, 682]),                               # cis-2-butene reaction (text opts)
            47:  [(3, [308, 596, 584, 732]), (4, [38, 60, 301, 170])],   # stem+opts a,b R pg3 | opts c,d L-top pg4
            71:  [(5, [38, 605, 301, 743]), (5, [308, 62, 584, 105])],   # stem+rxn+opts a,b L-bot pg5 | opts c,d R-top pg5
            84:  [(6, [38, 692, 301, 741]), (6, [308, 62, 584, 276])],   # stem L-bot pg6 | opts a-d structures R-top pg6
            97:  [(7, [38, 664, 301, 731]), (7, [308, 85, 584, 247])],   # stem+col-I(a) L-bot pg7 | b,c,d+codes R-top pg7
            105: [(7, [308, 691, 584, 742]), (8, [38, 60, 301, 159])],   # stem+a,b R-bot pg7 | c,d+codes L-top pg8
            107: (8, [38, 209, 301, 376]),                               # match-list+codes (extend past Q108 for (d) row)
            116: (8, [308, 229, 584, 373]),                              # match-list+codes (extend past Q117)
            124: (9, [38, 190, 301, 344]),                               # match-list+codes (extend past Q125)
            131: (9, [308, 64, 584, 207]),                               # match-list+codes (extend past Q132)
            174: (12, [38, 120, 301, 286]),                              # match-list+codes (extend past Q175)
        },
    },
    '2018': {   # right col extends to x=584; many bio Column-I/II match tables
        'block': set(range(1, 46)) | {47, 51, 53, 74, 79, 80, 88, 90}
                 | {112, 147, 152, 157, 161, 162, 173, 174},
        'figure': {63},
        'manual': {   # columns: L=[38,301], R=[308,584]
            # physics flows continuously -> cross-column/page stems need continuation stitched
            4:   [(0, [38, 671, 301, 734]), (0, [308, 288, 584, 352])],  # stem L-bottom pg0 | n-value opts R-top pg0
            10:  [(0, [308, 711, 584, 742]), (1, [38, 62, 301, 169])],   # stem R-bottom pg0 | E-field cont+opts L-top pg1
            17:  [(1, [38, 700, 301, 740]), (1, [308, 62, 584, 152])],   # stem L-bottom pg1 | de-Broglie cont+opts R-top pg1
            24:  [(1, [308, 618, 584, 734]), (2, [38, 62, 301, 112])],   # stem R-bottom pg1 | opts c,d L-top pg2
            30:  [(2, [38, 662, 301, 748]), (2, [308, 60, 584, 76])],    # stem L-bottom pg2 | current opts (1 line) R-top pg2
            38:  [(2, [308, 684, 584, 748]), (3, [38, 60, 301, 155])],   # stem R-bottom pg2 | ellipse fig+opts L-top pg3
            42:  [(3, [38, 424, 301, 450]), (3, [308, 62, 584, 193])],   # stem L pg3 | vertical-circle fig+opts R-top pg3
            51:  [(3, [308, 614, 584, 748]), (4, [38, 60, 301, 205])],   # rxn scheme+opt(a) pg3-R | opts b,c,d pg4-L
            63:  (4, [308, 483, 584, 533]),                              # Br Latimer/emf diagram (text opts)
            74:  [(5, [38, 700, 301, 732]), (5, [308, 60, 584, 322])],   # stem left-bottom | A-D M/10 mixtures+opts right-top
            88:  [(6, [38, 660, 301, 752]), (6, [308, 95, 584, 240])],   # Reimer-Tiemann rxn left-bottom | opts right-top
            112: [(7, [308, 422, 584, 745]), (8, [38, 58, 301, 182])],   # table pg7-R | codes pg8-L
            147: [(9, [308, 586, 584, 745]), (10, [38, 58, 301, 182])],  # table pg9-R | codes pg10-L
            162: (11, [38, 95, 301, 326]),                               # table+codes pg11-L (stem on pg10-R)
            173: (11, [308, 311, 584, 531]),                             # table+codes right col (extend for last code row)
            174: [(11, [308, 525, 584, 745]), (12, [38, 58, 301, 182])], # table pg11-R | codes pg12-L
        },
    },
    '2017': {
        'block': set(range(1, 46)) | {46, 53, 55, 56, 62, 64, 84}
                 | {49, 105, 175},
        'figure': {51, 66},
        'manual': {   # columns: L=[38,300], R=[308,584]
            42:  [(3, [38, 530, 301, 547]), (3, [305, 58, 588, 218])],   # stem left | equipotential diagrams+opts right-top
            49:  [(3, [305, 678, 588, 744]), (4, [38, 60, 301, 226])],   # rxn stem pg3-R | (A)/(B) structure opts pg4-L
            51:  (4, [108, 312, 301, 396]),                              # aldehyde-ketone structure (text opts)
            66:  (5, [308, 108, 588, 168]),                              # 3 aniline structures (text opts)
            175: [(11, [38, 630, 301, 672]), (11, [305, 58, 588, 273])], # stem left | X/Y explanation table opts right-top
        },
    },
    '2016p2': {
        'block': set(range(1, 46)) | {52, 77, 78, 79, 80, 81, 83, 84, 85, 87, 88, 89}
                 | {116, 137, 145, 146, 163, 175},
        'figure': {144},
        'manual': {   # columns: L=[38,300], R=[308,567]
            84:  [(5, [308, 600, 567, 752]), (6, [38, 58, 300, 175])],  # opts a,b pg5-R | c,d pg6-L
            87:  [(6, [38, 420, 300, 540]), (6, [308, 58, 567, 460])],  # stem+rxn | opts right col
            144: (9, [38, 445, 292, 580]),                              # activation-energy graph
            175: [(11, [38, 383, 300, 464]), (11, [308, 58, 567, 135])],# table | codes right col
        },
    },
}
cfg = CONFIG[key]
BLOCK, FIGURE, MANUAL = cfg['block'], cfg['figure'], cfg['manual']
WHITEN = cfg.get('whiten', False)   # strip faint full-page watermark (2025+)

def render(pno, rect):
    r = fitz.Rect(rect) & doc[pno].rect
    pm = doc[pno].get_pixmap(clip=r, dpi=DPI, alpha=False)
    img = Image.frombytes('RGB', (pm.width, pm.height), pm.samples)
    if WHITEN:
        # min-channel whitening: light-but-tinted watermark pixels -> white,
        # dark text and coloured structures (low min-channel) are preserved.
        import numpy as np
        a = np.asarray(img).astype(np.int16)
        mn = a.min(axis=2)
        a[mn >= 170] = 255
        img = Image.fromarray(a.astype('uint8'), 'RGB')
    return img

def render_manual(spec):
    parts = spec if isinstance(spec, list) else [spec]
    imgs = [render(p, r) for p, r in parts]
    if len(imgs) == 1:
        return imgs[0]
    w = max(i.width for i in imgs)
    h = sum(i.height for i in imgs) + 10 * (len(imgs) - 1)
    canvas = Image.new('RGB', (w, h), (255, 255, 255))
    y = 0
    for im in imgs:
        canvas.paste(im, (0, y)); y += im.height + 10
    return canvas

qs = json.load(open(in_json, encoding='utf-8'))
n_img = 0
for q in qs:
    n = q['n']
    mode = 'block' if n in BLOCK else ('figure' if n in FIGURE else None)
    if mode is None:
        continue
    if n in MANUAL:
        img = render_manual(MANUAL[n])
    elif mode == 'figure' and q.get('fig'):
        img = render(q['page'], q['fig'])
    elif q.get('crop'):
        img = render(q['page'], q['crop'])
    else:
        print(f"  [warn] Q{n} ({mode}) has no crop rect"); continue
    fn = f"q-{n}.png"
    img.save(os.path.join(extract_dir, fn))
    q['qi'] = fn
    if mode == 'block':
        q['opts'] = ['(A)', '(B)', '(C)', '(D)']
    n_img += 1

for q in qs:
    for k in ('page', 'y', 'crop', 'fig', 'img'):
        q.pop(k, None)

json.dump(qs, open(out_json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"rendered {n_img} images -> {extract_dir}; wrote {out_json}")

if QA:
    imgs = sorted((q['n'], os.path.join(extract_dir, q['qi']))
                  for q in qs if q.get('qi'))
    per = 6
    for pi in range(0, len(imgs), per * 4):
        chunk = imgs[pi:pi + per * 4]
        thumbs = []
        for n, p in chunk:
            im = Image.open(p); im.thumbnail((230, 230)); thumbs.append((n, im))
        cw, ch, cols = 240, 250, per
        rows = (len(thumbs) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * cw, rows * ch), (255, 255, 255))
        dr = ImageDraw.Draw(sheet)
        for i, (n, im) in enumerate(thumbs):
            x, y = (i % cols) * cw, (i // cols) * ch
            dr.text((x + 4, y + 2), f"Q{n}", fill=(200, 0, 0))
            sheet.paste(im, (x + 4, y + 16))
        sp = os.environ.get('SP', extract_dir)
        sheet.save(f"{sp}/qa_{key}_{pi}.png")
    print("QA sheets written")
