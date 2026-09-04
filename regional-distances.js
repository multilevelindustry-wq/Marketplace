/* regional-distances.js
   Region/state/province delivery engine.
   Regions are represented by approximate central coordinates.
   Add more country entries to REGIONS whenever you want finer
   intra-country pricing. Countries without a region dataset fall
   back to country-level distance.
*/
import { haversineKm } from "./country-distances.js";

export const REGIONS = {
   "BA": [
        {
            "name": "Federation of Bosnia and Herzegovina",
            "lat": 44.0000,
            "lng": 17.5833
        },
        {
            "name": "Republika Srpska",
            "lat": 44.7333,
            "lng": 17.4000
        },
        {
            "name": "Brčko District",
            "lat": 44.8333,
            "lng": 18.8333
        }
    ],
   "BF": [
        {
            "name": "Boucle du Mouhoun",
            "lat": 12.3833,
            "lng": -3.4667
        },
        {
            "name": "Cascades",
            "lat": 10.6333,
            "lng": -5.1667
        },
        {
            "name": "Centre",
            "lat": 12.3714,
            "lng": -1.5197
        },
        {
            "name": "Centre-Est",
            "lat": 11.7833,
            "lng": -0.3667
        },
        {
            "name": "Centre-Nord",
            "lat": 13.2500,
            "lng": -1.5500
        },
        {
            "name": "Centre-Ouest",
            "lat": 11.6667,
            "lng": -2.9333
        },
        {
            "name": "Centre-Sud",
            "lat": 11.3000,
            "lng": -1.1333
        },
        {
            "name": "Est",
            "lat": 12.0500,
            "lng": 1.7833
        },
        {
            "name": "Hauts-Bassins",
            "lat": 11.1833,
            "lng": -4.2833
        },
        {
            "name": "Nord",
            "lat": 13.5833,
            "lng": -2.4167
        },
        {
            "name": "Plateau-Central",
            "lat": 12.2500,
            "lng": -1.4167
        },
        {
            "name": "Sahel",
            "lat": 14.0333,
            "lng": -0.0333
        },
        {
            "name": "Sud-Ouest",
            "lat": 10.3000,
            "lng": -3.1667
        }
    ],
   "BW": [
        {
            "name": "Gaborone",
            "lat": -24.6282,
            "lng": 25.9231
        },
        {
            "name": "Francistown",
            "lat": -21.1592,
            "lng": 27.5036
        },
        {
            "name": "Molepolole",
            "lat": -24.4066,
            "lng": 25.4951
        },
        {
            "name": "Maun",
            "lat": -19.9833,
            "lng": 23.4167
        },
        {
            "name": "Kasane",
            "lat": -17.8167,
            "lng": 25.1500
        },
        {
            "name": "Selebi-Phikwe",
            "lat": -21.9780,
            "lng": 27.8420
        },
        {
            "name": "Palapye",
            "lat": -22.5460,
            "lng": 27.1250
        },
        {
            "name": "Jwaneng",
            "lat": -24.6000,
            "lng": 24.7333
        },
        {
            "name": "Lobatse",
            "lat": -25.2167,
            "lng": 25.6667
        },
        {
            "name": "Sowa Town",
            "lat": -20.5667,
            "lng": 25.9000
        }
    ],
   "BN": [
        {
            "name": "Brunei-Muara",
            "lat": 4.9031,
            "lng": 114.9398
        },
        {
            "name": "Belait",
            "lat": 4.5833,
            "lng": 114.1833
        },
        {
            "name": "Tutong",
            "lat": 4.8000,
            "lng": 114.6500
        },
        {
            "name": "Temburong",
            "lat": 4.6500,
            "lng": 115.1500
        }
    ],
 "BG": [
        {
            "name": "Blagoevgrad",
            "lat": 42.0209,
            "lng": 23.0943
        },
        {
            "name": "Burgas",
            "lat": 42.5048,
            "lng": 27.4626
        },
        {
            "name": "Dobrich",
            "lat": 43.5726,
            "lng": 27.8273
        },
        {
            "name": "Gabrovo",
            "lat": 42.8742,
            "lng": 25.3342
        },
        {
            "name": "Haskovo",
            "lat": 41.9342,
            "lng": 25.5556
        },
        {
            "name": "Kardzhali",
            "lat": 41.6500,
            "lng": 25.3667
        },
        {
            "name": "Kyustendil",
            "lat": 42.2839,
            "lng": 22.6911
        },
        {
            "name": "Lovech",
            "lat": 43.1367,
            "lng": 24.7144
        },
        {
            "name": "Montana",
            "lat": 43.4125,
            "lng": 23.2250
        },
        {
            "name": "Pazardzhik",
            "lat": 42.1928,
            "lng": 24.3336
        },
        {
            "name": "Pernik",
            "lat": 42.6052,
            "lng": 23.0378
        },
        {
            "name": "Pleven",
            "lat": 43.4095,
            "lng": 24.6170
        },
        {
            "name": "Plovdiv",
            "lat": 42.1354,
            "lng": 24.7453
        },
        {
            "name": "Razgrad",
            "lat": 43.5333,
            "lng": 26.5167
        },
        {
            "name": "Ruse",
            "lat": 43.8356,
            "lng": 25.9657
        },
        {
            "name": "Shumen",
            "lat": 43.2712,
            "lng": 26.9361
        },
        {
            "name": "Silistra",
            "lat": 44.1171,
            "lng": 27.2606
        },
        {
            "name": "Sliven",
            "lat": 42.6858,
            "lng": 26.3292
        },
        {
            "name": "Smolyan",
            "lat": 41.5774,
            "lng": 24.7010
        },
        {
            "name": "Sofia City",
            "lat": 42.6977,
            "lng": 23.3219
        },
        {
            "name": "Sofia Province",
            "lat": 42.6500,
            "lng": 23.0000
        },
        {
            "name": "Stara Zagora",
            "lat": 42.4258,
            "lng": 25.6345
        },
        {
            "name": "Targovishte",
            "lat": 43.2512,
            "lng": 26.5721
        },
        {
            "name": "Varna",
            "lat": 43.2141,
            "lng": 27.9147
        },
        {
            "name": "Veliko Tarnovo",
            "lat": 43.0757,
            "lng": 25.6172
        },
        {
            "name": "Vidin",
            "lat": 43.9962,
            "lng": 22.8679
        },
        {
            "name": "Vratsa",
            "lat": 43.2102,
            "lng": 23.5529
        },
        {
            "name": "Yambol",
            "lat": 42.4846,
            "lng": 26.5035
        }
    ],
           "BI": [
        {
            "name": "Bubanza",
            "lat": -3.0833,
            "lng": 29.4000
        },
        {
            "name": "Bujumbura Mairie",
            "lat": -3.3822,
            "lng": 29.3644
        },
        {
            "name": "Bujumbura Rural",
            "lat": -3.5000,
            "lng": 29.4500
        },
        {
            "name": "Bururi",
            "lat": -3.9500,
            "lng": 29.6167
        },
        {
            "name": "Cankuzo",
            "lat": -3.2167,
            "lng": 30.5500
        },
        {
            "name": "Cibitoke",
            "lat": -2.8833,
            "lng": 29.1167
        },
        {
            "name": "Gitega",
            "lat": -3.4260,
            "lng": 29.9300
        },
        {
            "name": "Karuzi",
            "lat": -3.1000,
            "lng": 30.1667
        },
        {
            "name": "Kayanza",
            "lat": -2.9221,
            "lng": 29.6293
        },
        {
            "name": "Kirundo",
            "lat": -2.5833,
            "lng": 30.1000
        },
        {
            "name": "Makamba",
            "lat": -4.1333,
            "lng": 29.8000
        },
        {
            "name": "Muramvya",
            "lat": -3.2667,
            "lng": 29.6167
        },
        {
            "name": "Muyinga",
            "lat": -2.8500,
            "lng": 30.3333
        },
        {
            "name": "Mwaro",
            "lat": -3.5000,
            "lng": 29.7000
        },
        {
            "name": "Ngozi",
            "lat": -2.9075,
            "lng": 29.8306
        },
        {
            "name": "Rumonge",
            "lat": -3.9736,
            "lng": 29.4386
        },
        {
            "name": "Rutana",
            "lat": -3.9250,
            "lng": 29.9933
        },
        {
            "name": "Ruyigi",
            "lat": -3.4764,
            "lng": 30.2486
        }
    ],
   "CO": [
        {
            "name": "Amazonas",
            "lat": -4.2153,
            "lng": -69.9406
        },
        {
            "name": "Antioquia",
            "lat": 6.2442,
            "lng": -75.5812
        },
        {
            "name": "Arauca",
            "lat": 7.0903,
            "lng": -70.7617
        },
        {
            "name": "Atlántico",
            "lat": 10.9685,
            "lng": -74.7813
        },
        {
            "name": "Bolívar",
            "lat": 10.3910,
            "lng": -75.4794
        },
        {
            "name": "Boyacá",
            "lat": 5.5353,
            "lng": -73.3678
        },
        {
            "name": "Caldas",
            "lat": 5.0689,
            "lng": -75.5174
        },
        {
            "name": "Caquetá",
            "lat": 1.6144,
            "lng": -75.6062
        },
        {
            "name": "Casanare",
            "lat": 5.3378,
            "lng": -72.3959
        },
        {
            "name": "Cauca",
            "lat": 2.4448,
            "lng": -76.6147
        },
        {
            "name": "Cesar",
            "lat": 10.4631,
            "lng": -73.2532
        },
        {
            "name": "Chocó",
            "lat": 5.6947,
            "lng": -76.6611
        },
        {
            "name": "Córdoba",
            "lat": 8.7479,
            "lng": -75.8814
        },
        {
            "name": "Cundinamarca",
            "lat": 4.7110,
            "lng": -74.0721
        },
        {
            "name": "Bogotá D.C.",
            "lat": 4.7110,
            "lng": -74.0721
        },
        {
            "name": "Guainía",
            "lat": 3.8653,
            "lng": -67.9239
        },
        {
            "name": "Guaviare",
            "lat": 2.5729,
            "lng": -72.6459
        },
        {
            "name": "Huila",
            "lat": 2.5359,
            "lng": -75.5277
        },
        {
            "name": "La Guajira",
            "lat": 11.5444,
            "lng": -72.9072
        },
        {
            "name": "Magdalena",
            "lat": 11.2408,
            "lng": -74.1990
        },
        {
            "name": "Meta",
            "lat": 4.1420,
            "lng": -73.6266
        },
        {
            "name": "Nariño",
            "lat": 1.2136,
            "lng": -77.2811
        },
        {
            "name": "Norte de Santander",
            "lat": 7.8939,
            "lng": -72.5078
        },
        {
            "name": "Putumayo",
            "lat": 1.1525,
            "lng": -76.6469
        },
        {
            "name": "Quindío",
            "lat": 4.5339,
            "lng": -75.6811
        },
        {
            "name": "Risaralda",
            "lat": 4.8143,
            "lng": -75.6946
        },
        {
            "name": "Santander",
            "lat": 7.1254,
            "lng": -73.1198
        },
        {
            "name": "Sucre",
            "lat": 9.3047,
            "lng": -75.3978
        },
        {
            "name": "Tolima",
            "lat": 4.4389,
            "lng": -75.2322
        },
        {
            "name": "Valle del Cauca",
            "lat": 3.4516,
            "lng": -76.5320
        },
        {
            "name": "Vaupés",
            "lat": 0.8554,
            "lng": -70.8110
        },
        {
            "name": "Vichada",
            "lat": 6.1851,
            "lng": -67.4859
        }
    ],
    "HR": [
        {
            "name": "Bjelovar-Bilogora",
            "lat": 45.8986,
            "lng": 16.8422
        },
        {
            "name": "Brod-Posavina",
            "lat": 45.1603,
            "lng": 18.0156
        },
        {
            "name": "Dubrovnik-Neretva",
            "lat": 42.6507,
            "lng": 18.0944
        },
        {
            "name": "Istria",
            "lat": 44.8666,
            "lng": 13.8496
        },
        {
            "name": "Karlovac",
            "lat": 45.4929,
            "lng": 15.5553
        },
        {
            "name": "Koprivnica-Križevci",
            "lat": 46.1628,
            "lng": 16.8278
        },
        {
            "name": "Krapina-Zagorje",
            "lat": 46.1608,
            "lng": 15.8789
        },
        {
            "name": "Lika-Senj",
            "lat": 44.5469,
            "lng": 15.3747
        },
        {
            "name": "Međimurje",
            "lat": 46.3844,
            "lng": 16.4336
        },
        {
            "name": "Osijek-Baranja",
            "lat": 45.5540,
            "lng": 18.6955
        },
        {
            "name": "Požega-Slavonia",
            "lat": 45.3400,
            "lng": 17.6853
        },
        {
            "name": "Primorje-Gorski Kotar",
            "lat": 45.3271,
            "lng": 14.4422
        },
        {
            "name": "Šibenik-Knin",
            "lat": 43.7350,
            "lng": 15.8952
        },
        {
            "name": "Sisak-Moslavina",
            "lat": 45.4875,
            "lng": 16.3750
        },
        {
            "name": "Split-Dalmatia",
            "lat": 43.5081,
            "lng": 16.4402
        },
        {
            "name": "Varaždin",
            "lat": 46.3050,
            "lng": 16.3366
        },
        {
            "name": "Virovitica-Podravina",
            "lat": 45.8319,
            "lng": 17.3839
        },
        {
            "name": "Vukovar-Srijem",
            "lat": 45.3522,
            "lng": 19.0000
        },
        {
            "name": "Zadar",
            "lat": 44.1194,
            "lng": 15.2314
        },
        {
            "name": "Zagreb County",
            "lat": 45.8564,
            "lng": 15.8078
        },
        {
            "name": "City of Zagreb",
            "lat": 45.8150,
            "lng": 15.9819
        }
    ],
   "KH": [
        {
            "name": "Banteay Meanchey",
            "lat": 13.5859,
            "lng": 102.9737
        },
        {
            "name": "Battambang",
            "lat": 13.0957,
            "lng": 103.2022
        },
        {
            "name": "Kampong Cham",
            "lat": 11.9934,
            "lng": 105.4635
        },
        {
            "name": "Kampong Chhnang",
            "lat": 12.2500,
            "lng": 104.6667
        },
        {
            "name": "Kampong Speu",
            "lat": 11.4533,
            "lng": 104.5209
        },
        {
            "name": "Kampong Thom",
            "lat": 12.7111,
            "lng": 104.8887
        },
        {
            "name": "Kampot",
            "lat": 10.6104,
            "lng": 104.1815
        },
        {
            "name": "Kandal",
            "lat": 11.2237,
            "lng": 105.1259
        },
        {
            "name": "Kep",
            "lat": 10.4829,
            "lng": 104.3167
        },
        {
            "name": "Koh Kong",
            "lat": 11.6153,
            "lng": 102.9838
        },
        {
            "name": "Kratié",
            "lat": 12.4881,
            "lng": 106.0188
        },
        {
            "name": "Mondulkiri",
            "lat": 12.4558,
            "lng": 107.1881
        },
        {
            "name": "Oddar Meanchey",
            "lat": 14.1818,
            "lng": 103.5175
        },
        {
            "name": "Pailin",
            "lat": 12.8480,
            "lng": 102.6093
        },
        {
            "name": "Phnom Penh",
            "lat": 11.5564,
            "lng": 104.9282
        },
        {
            "name": "Preah Sihanouk",
            "lat": 10.6250,
            "lng": 103.5230
        },
        {
            "name": "Preah Vihear",
            "lat": 13.7998,
            "lng": 104.9800
        },
        {
            "name": "Prey Veng",
            "lat": 11.4868,
            "lng": 105.3253
        },
        {
            "name": "Pursat",
            "lat": 12.5388,
            "lng": 103.9192
        },
        {
            "name": "Ratanakiri",
            "lat": 13.7394,
            "lng": 106.9873
        },
        {
            "name": "Siem Reap",
            "lat": 13.3618,
            "lng": 103.8606
        },
        {
            "name": "Stung Treng",
            "lat": 13.5259,
            "lng": 105.9690
        },
        {
            "name": "Svay Rieng",
            "lat": 11.0879,
            "lng": 105.7993
        },
        {
            "name": "Takeo",
            "lat": 10.9908,
            "lng": 104.7847
        },
        {
            "name": "Tboung Khmum",
            "lat": 11.8050,
            "lng": 105.8200
        }
    ],
   "CM": [
        {
            "name": "Adamawa",
            "lat": 7.3277,
            "lng": 13.5847
        },
        {
            "name": "Centre",
            "lat": 3.8667,
            "lng": 11.5167
        },
        {
            "name": "East",
            "lat": 4.5833,
            "lng": 13.6833
        },
        {
            "name": "Far North",
            "lat": 10.5909,
            "lng": 14.3159
        },
        {
            "name": "Littoral",
            "lat": 4.0483,
            "lng": 9.7043
        },
        {
            "name": "North",
            "lat": 9.3000,
            "lng": 13.4000
        },
        {
            "name": "North-West",
            "lat": 5.9631,
            "lng": 10.1591
        },
        {
            "name": "South",
            "lat": 2.9333,
            "lng": 11.1500
        },
        {
            "name": "South-West",
            "lat": 4.1550,
            "lng": 9.2317
        },
        {
            "name": "West",
            "lat": 5.4769,
            "lng": 10.4176
        }
    ],
   
   
    "NG": [
        {
            "name": "Abia",
            "lat": 5.532,
            "lng": 7.486
        },
        {
            "name": "Adamawa",
            "lat": 9.3265,
            "lng": 12.3984
        },
        {
            "name": "Akwa Ibom",
            "lat": 5.0077,
            "lng": 7.8494
        },
        {
            "name": "Anambra",
            "lat": 6.2209,
            "lng": 6.937
        },
        {
            "name": "Bauchi",
            "lat": 10.3158,
            "lng": 9.8442
        },
        {
            "name": "Bayelsa",
            "lat": 4.7719,
            "lng": 6.0699
        },
        {
            "name": "Benue",
            "lat": 7.1904,
            "lng": 8.1298
        },
        {
            "name": "Borno",
            "lat": 11.8333,
            "lng": 13.15
        },
        {
            "name": "Cross River",
            "lat": 5.8702,
            "lng": 8.5988
        },
        {
            "name": "Delta",
            "lat": 5.5325,
            "lng": 5.8987
        },
        {
            "name": "Ebonyi",
            "lat": 6.2649,
            "lng": 8.0137
        },
        {
            "name": "Edo",
            "lat": 6.335,
            "lng": 5.6037
        },
        {
            "name": "Ekiti",
            "lat": 7.6656,
            "lng": 5.3103
        },
        {
            "name": "Enugu",
            "lat": 6.4584,
            "lng": 7.5464
        },
        {
            "name": "Gombe",
            "lat": 10.2897,
            "lng": 11.1673
        },
        {
            "name": "Imo",
            "lat": 5.572,
            "lng": 7.0588
        },
        {
            "name": "Jigawa",
            "lat": 12.228,
            "lng": 9.5616
        },
        {
            "name": "Kaduna",
            "lat": 10.5105,
            "lng": 7.4165
        },
        {
            "name": "Kano",
            "lat": 12.0022,
            "lng": 8.592
        },
        {
            "name": "Katsina",
            "lat": 12.9908,
            "lng": 7.6
        },
        {
            "name": "Kebbi",
            "lat": 12.45,
            "lng": 4.2
        },
        {
            "name": "Kogi",
            "lat": 7.7337,
            "lng": 6.6906
        },
        {
            "name": "Kwara",
            "lat": 8.9669,
            "lng": 4.3874
        },
        {
            "name": "Lagos",
            "lat": 6.5244,
            "lng": 3.3792
        },
        {
            "name": "Nasarawa",
            "lat": 8.538,
            "lng": 8.037
        },
        {
            "name": "Niger",
            "lat": 9.6,
            "lng": 6.5569
        },
        {
            "name": "Ogun",
            "lat": 6.998,
            "lng": 3.4737
        },
        {
            "name": "Ondo",
            "lat": 7.1,
            "lng": 4.84
        },
        {
            "name": "Osun",
            "lat": 7.5629,
            "lng": 4.52
        },
        {
            "name": "Oyo",
            "lat": 7.3775,
            "lng": 3.947
        },
        {
            "name": "Plateau",
            "lat": 9.2182,
            "lng": 9.5179
        },
        {
            "name": "Rivers",
            "lat": 4.8156,
            "lng": 7.0498
        },
        {
            "name": "Sokoto",
            "lat": 13.0622,
            "lng": 5.2339
        },
        {
            "name": "Taraba",
            "lat": 8.0,
            "lng": 10.77
        },
        {
            "name": "Yobe",
            "lat": 12.2939,
            "lng": 11.439
        },
        {
            "name": "Zamfara",
            "lat": 12.17,
            "lng": 6.66
        },
        {
            "name": "FCT",
            "lat": 9.0765,
            "lng": 7.3986
        }
    ],

  "BS": [
    { "name": "New Providence", "lat": 25.0343, "lng": -77.3963 },
    { "name": "Grand Bahama", "lat": 26.5250, "lng": -78.6102 },
    { "name": "Abaco", "lat": 26.6131, "lng": -77.1040 },
    { "name": "Andros", "lat": 24.7000, "lng": -77.8000 },
    { "name": "Eleuthera", "lat": 25.2000, "lng": -76.2000 },
    { "name": "Exuma", "lat": 23.5000, "lng": -75.5000 },
    { "name": "Long Island", "lat": 23.4000, "lng": -75.2000 },
    { "name": "Cat Island", "lat": 24.2000, "lng": -75.5000 },
    { "name": "Bimini", "lat": 25.7333, "lng": -79.2833 }
  ],
  "BH": [
    { "name": "Capital Governorate", "lat": 26.0275, "lng": 50.5350 },
    { "name": "Muharraq Governorate", "lat": 26.2575, "lng": 50.6100 },
    { "name": "Northern Governorate", "lat": 26.2000, "lng": 50.6000 },
    { "name": "Southern Governorate", "lat": 25.9000, "lng": 50.5000 },
    { "name": "Central Governorate", "lat": 26.1000, "lng": 50.5000 }
  ],
  "BD": [
    { "name": "Dhaka", "lat": 23.8103, "lng": 90.4125 },
    { "name": "Chittagong", "lat": 22.3569, "lng": 91.7832 },
    { "name": "Khulna", "lat": 22.8150, "lng": 89.5403 },
    { "name": "Rajshahi", "lat": 24.3735, "lng": 88.6040 },
    { "name": "Barisal", "lat": 22.7010, "lng": 90.3670 },
    { "name": "Sylhet", "lat": 24.8940, "lng": 91.8687 },
    { "name": "Rangpur", "lat": 25.7450, "lng": 89.2500 },
    { "name": "Mymensingh", "lat": 24.7470, "lng": 90.4150 }
  ],
  "BY": [
    { "name": "Minsk", "lat": 53.9045, "lng": 27.5590 },
    { "name": "Brest", "lat": 52.0970, "lng": 23.6880 },
    { "name": "Gomel", "lat": 52.4410, "lng": 30.9754 },
    { "name": "Mogilev", "lat": 53.9000, "lng": 30.1667 },
    { "name": "Vitebsk", "lat": 55.1910, "lng": 30.2030 },
    { "name": "Grodno", "lat": 53.6667, "lng": 23.8333 },
    { "name": "Brest Region", "lat": 52.5000, "lng": 23.5000 },
    { "name": "Gomel Region", "lat": 52.5000, "lng": 30.5000 },
    { "name": "Mogilev Region", "lat": 53.5000, "lng": 30.5000 },
    { "name": "Vitebsk Region", "lat": 55.5000, "lng": 30.5000 },
    { "name": "Grodno Region", "lat": 53.5000, "lng": 23.5000 }
  ],
  "BB": [
    { "name": "Christ Church", "lat": 13.0667, "lng": -59.5333 },
    { "name": "Saint Michael", "lat": 13.1000, "lng": -59.6167 },
    { "name": "Saint James", "lat": 13.1833, "lng": -59.6167 },
    { "name": "Saint Peter", "lat": 13.2500, "lng": -59.6167 },
    { "name": "Saint Lucy", "lat": 13.2667, "lng": -59.6167 },
    { "name": "Saint George", "lat": 13.1167, "lng": -59.6167 },
    { "name": "Saint Thomas", "lat": 13.1333, "lng": -59.6167 },
    { "name": "Saint Joseph", "lat": 13.1333, "lng": -59.6167 },
    { "name": "Saint Andrew", "lat": 13.1667, "lng": -59.6167 }
  ],
  "BE": [
    { "name": "Brussels-Capital Region", "lat": 50.8503, "lng": 4.3517 },
    { "name": "Antwerp", "lat": 51.2211, "lng": 4.4213 },
    { "name": "Flemish Brabant", "lat": 50.9500, "lng": 4.5000 },
    { "name": "Walloon Brabant", "lat": 50.6000, "lng": 4.5000 },
    { "name": "Namur", "lat": 50.4667, "lng": 4.8667 },
    { "name": "Liège", "lat": 50.6000, "lng": 5.5667 },
    { "name": "Luxembourg", "lat": 49.7500, "lng": 5.5000 },
    { "name": "Hainaut", "lat": 50.5000, "lng": 3.5000 },
    { "name": "East Flanders", "lat": 51.0500, "lng": 3.5000 },
    { "name": "West Flanders", "lat": 51.0500, "lng": 3.2000 }
  ],
  "BZ": [
    { "name": "Belize District", "lat": 17.5000, "lng": -88.2000 },
    { "name": "Cayo District", "lat": 17.2500, "lng": -89.0833 },
    { "name": "Corozal District", "lat": 18.5000, "lng": -88.4000 },
    { "name": "Orange Walk District", "lat": 18.0833, "lng": -88.5833 },
    { "name": "Stann Creek District", "lat": 16.7500, "lng": -88.2500 },
    { "name": "Toledo District", "lat": 16.2500, "lng": -88.7500 }
  ],
  "BJ": [
    { "name": "Alibori", "lat": 10.0000, "lng": 8.0000 },
    { "name": "Atakora", "lat": 10.0000, "lng": 1.0000 },
    { "name": "Atlantique", "lat": 6.5000, "lng": 2.5000 },
    { "name": "Borgou", "lat": 9.0000, "lng": 2.0000 },
    { "name": "Collines", "lat": 7.0000, "lng": 2.0000 },
    { "name": "Donga", "lat": 9.0000, "lng": 1.0000 },
    { "name": "Littoral", "lat": 6.5000, "lng": 2.5000 },
    { "name": "Mono", "lat": 6.0000, "lng": 1.5000 },
    { "name": "Ouémé", "lat": 7.0000, "lng": 2.5000 },
    { "name": "Plateau", "lat": 7.0000, "lng": 2.0000 },
    { "name": "Zou", "lat": 7.0000, "lng": 2.5000 }
  ],
  "BT": [
    { "name": "Thimphu", "lat": 27.5149, "lng": 89.6395 },
    { "name": "Paro", "lat": 27.4280, "lng": 89.4260 },
    { "name": "Punakha", "lat": 27.5000, "lng": 89.5000 },
    { "name": "Wangdue Phodrang", "lat": 27.5000, "lng": 89.5000 },
    { "name": "Trashigang", "lat": 27.3333, "lng": 91.5833 },
    { "name": "Samdrup Jongkhar", "lat": 26.8000, "lng": 91.5833 },
    { "name": "Bumthang", "lat": 27.5000, "lng": 90.5000 },
    { "name": "Trongsa", "lat": 27.5000, "lng": 90.5000 },
    { "name": "Zhemgang", "lat": 27.5000, "lng": 90.5000 }
  ],
  "BO": [
    { "name": "La Paz", "lat": -16.5000, "lng": -68.1193 },
    { "name": "Santa Cruz", "lat": -17.7833, "lng": -63.1825 },
    { "name": "Cochabamba", "lat": -17.3667, "lng": -66.1667 },
    { "name": "Potosí", "lat": -19.5833, "lng": -65.7500 },
    { "name": "Oruro", "lat": -17.9667, "lng": -67.1167 },
    { "name": "Beni", "lat": -14.0000, "lng": -66.0000 },
    { "name": "Pando", "lat": -11.0000, "lng": -68.0000 },
    { "name": "Tarija", "lat": -21.0000, "lng": -64.0000 },
    { "name": "Chuquisaca", "lat": -19.0000, "lng": -65.0000 },
    { "name": "La Paz Department", "lat": -16.5000, "lng": -68.1193 }
  ],

   "AF": [
    {
        "name": "Badakhshan",
        "lat": 36.7348,
        "lng": 70.8110
    },
    {
        "name": "Badghis",
        "lat": 35.0830,
        "lng": 63.5490
    },
    {
        "name": "Baghlan",
        "lat": 35.7500,
        "lng": 68.8330
    },
    {
        "name": "Balkh",
        "lat": 36.7500,
        "lng": 67.0000
    },
    {
        "name": "Bamyan",
        "lat": 34.8100,
        "lng": 67.8210
    },
    {
        "name": "Daykundi",
        "lat": 33.9500,
        "lng": 66.2500
    },
    {
        "name": "Farah",
        "lat": 32.4950,
        "lng": 62.2620
    },
    {
        "name": "Faryab",
        "lat": 36.0790,
        "lng": 64.9050
    },
    {
        "name": "Ghazni",
        "lat": 33.5530,
        "lng": 68.4260
    },
    {
        "name": "Ghor",
        "lat": 34.0000,
        "lng": 64.0000
    },
    {
        "name": "Helmand",
        "lat": 31.5830,
        "lng": 64.3670
    },
    {
        "name": "Herat",
        "lat": 34.3419,
        "lng": 62.2030
    },
    {
        "name": "Jowzjan",
        "lat": 36.8960,
        "lng": 65.6650
    },
    {
        "name": "Kabul",
        "lat": 34.5553,
        "lng": 69.2075
    },
    {
        "name": "Kandahar",
        "lat": 31.6289,
        "lng": 65.7372
    },
    {
        "name": "Kapisa",
        "lat": 35.0000,
        "lng": 69.7500
    },
    {
        "name": "Khost",
        "lat": 33.3330,
        "lng": 69.9170
    },
    {
        "name": "Kunar",
        "lat": 35.0000,
        "lng": 71.5000
    },
    {
        "name": "Kunduz",
        "lat": 36.7280,
        "lng": 68.8680
    },
    {
        "name": "Laghman",
        "lat": 34.7000,
        "lng": 70.1500
    },
    {
        "name": "Logar",
        "lat": 34.0000,
        "lng": 69.2000
    },
    {
        "name": "Nangarhar",
        "lat": 34.4300,
        "lng": 70.4500
    },
    {
        "name": "Nimruz",
        "lat": 31.0000,
        "lng": 62.5000
    },
    {
        "name": "Nuristan",
        "lat": 35.3000,
        "lng": 70.9000
    },
    {
        "name": "Paktia",
        "lat": 33.6000,
        "lng": 69.3000
    },
    {
        "name": "Paktika",
        "lat": 32.5000,
        "lng": 68.0000
    },
    {
        "name": "Panjshir",
        "lat": 35.3500,
        "lng": 69.8000
    },
    {
        "name": "Parwan",
        "lat": 35.0000,
        "lng": 69.2000
    },
    {
        "name": "Samangan",
        "lat": 35.8500,
        "lng": 67.7500
    },
    {
        "name": "Sar-e Pol",
        "lat": 35.5000,
        "lng": 65.5000
    },
    {
        "name": "Takhar",
        "lat": 36.7500,
        "lng": 69.5000
    },
    {
        "name": "Urozgan",
        "lat": 32.9000,
        "lng": 66.6000
    },
    {
        "name": "Wardak",
        "lat": 34.4000,
        "lng": 68.3000
    },
    {
        "name": "Zabul",
        "lat": 32.2500,
        "lng": 67.2500
    }
],

"AL": [
    {
        "name": "Berat",
        "lat": 40.7058,
        "lng": 19.9522
    },
    {
        "name": "Dibër",
        "lat": 41.5886,
        "lng": 20.2356
    },
    {
        "name": "Durrës",
        "lat": 41.3246,
        "lng": 19.4565
    },
    {
        "name": "Elbasan",
        "lat": 41.1102,
        "lng": 20.0867
    },
    {
        "name": "Fier",
        "lat": 40.7275,
        "lng": 19.5561
    },
    {
        "name": "Gjirokastër",
        "lat": 40.0673,
        "lng": 20.1047
    },
    {
        "name": "Korçë",
        "lat": 40.6167,
        "lng": 20.7667
    },
    {
        "name": "Kukës",
        "lat": 42.0769,
        "lng": 20.4219
    },
    {
        "name": "Lezhë",
        "lat": 41.7814,
        "lng": 19.6436
    },
    {
        "name": "Shkodër",
        "lat": 42.0693,
        "lng": 19.5033
    },
    {
        "name": "Tirana",
        "lat": 41.3275,
        "lng": 19.8187
    },
    {
        "name": "Vlorë",
        "lat": 40.4667,
        "lng": 19.4833
    }
],

"DZ": [
    {
        "name": "Adrar",
        "lat": 27.8743,
        "lng": -0.2939
    },
    {
        "name": "Aïn Defla",
        "lat": 36.2641,
        "lng": 1.9679
    },
    {
        "name": "Aïn Témouchent",
        "lat": 35.2975,
        "lng": -1.1404
    },
    {
        "name": "Algiers",
        "lat": 36.7538,
        "lng": 3.0588
    },
    {
        "name": "Annaba",
        "lat": 36.9000,
        "lng": 7.7667
    },
    {
        "name": "Batna",
        "lat": 35.5559,
        "lng": 6.1741
    },
    {
        "name": "Béchar",
        "lat": 31.6167,
        "lng": -2.2167
    },
    {
        "name": "Béjaïa",
        "lat": 36.7509,
        "lng": 5.0567
    },
    {
        "name": "Biskra",
        "lat": 34.8504,
        "lng": 5.7281
    },
    {
        "name": "Blida",
        "lat": 36.4700,
        "lng": 2.8300
    },
    {
        "name": "Bordj Badji Mokhtar",
        "lat": 21.3270,
        "lng": 0.9500
    },
    {
        "name": "Bordj Bou Arréridj",
        "lat": 36.0730,
        "lng": 4.7611
    },
    {
        "name": "Bouïra",
        "lat": 36.3749,
        "lng": 3.9020
    },
    {
        "name": "Boumerdès",
        "lat": 36.7667,
        "lng": 3.4667
    },
    {
        "name": "Chlef",
        "lat": 36.1653,
        "lng": 1.3345
    },
    {
        "name": "Constantine",
        "lat": 36.3650,
        "lng": 6.6147
    },
    {
        "name": "Djelfa",
        "lat": 34.6667,
        "lng": 3.2500
    },
    {
        "name": "El Bayadh",
        "lat": 33.6833,
        "lng": 1.0167
    },
    {
        "name": "El Oued",
        "lat": 33.3683,
        "lng": 6.8675
    },
    {
        "name": "El Tarf",
        "lat": 36.7672,
        "lng": 8.3138
    },
    {
        "name": "Ghardaïa",
        "lat": 32.4909,
        "lng": 3.6735
    },
    {
        "name": "Guelma",
        "lat": 36.4621,
        "lng": 7.4261
    },
    {
        "name": "Illizi",
        "lat": 26.4833,
        "lng": 8.4667
    },
    {
        "name": "Jijel",
        "lat": 36.8206,
        "lng": 5.7667
    },
    {
        "name": "Khenchela",
        "lat": 35.4358,
        "lng": 7.1433
    },
    {
        "name": "Laghouat",
        "lat": 33.8000,
        "lng": 2.8667
    },
    {
        "name": "M'Sila",
        "lat": 35.7058,
        "lng": 4.5419
    },
    {
        "name": "Mascara",
        "lat": 35.3966,
        "lng": 0.1403
    },
    {
        "name": "Médéa",
        "lat": 36.2642,
        "lng": 2.7539
    },
    {
        "name": "Mila",
        "lat": 36.4503,
        "lng": 6.2644
    },
    {
        "name": "Mostaganem",
        "lat": 35.9333,
        "lng": 0.0833
    },
    {
        "name": "Naâma",
        "lat": 33.2667,
        "lng": -0.3167
    },
    {
        "name": "Oran",
        "lat": 35.6969,
        "lng": -0.6331
    },
    {
        "name": "Ouargla",
        "lat": 31.9500,
        "lng": 5.3333
    },
    {
        "name": "Oum El Bouaghi",
        "lat": 35.8750,
        "lng": 7.1139
    },
    {
        "name": "Relizane",
        "lat": 35.7373,
        "lng": 0.5558
    },
    {
        "name": "Saïda",
        "lat": 34.8303,
        "lng": 0.1517
    },
    {
        "name": "Sétif",
        "lat": 36.1900,
        "lng": 5.4100
    },
    {
        "name": "Sidi Bel Abbès",
        "lat": 35.1899,
        "lng": -0.6309
    },
    {
        "name": "Skikda",
        "lat": 36.8667,
        "lng": 6.9000
    },
    {
        "name": "Souk Ahras",
        "lat": 36.2864,
        "lng": 7.9511
    },
    {
        "name": "Tamanrasset",
        "lat": 22.7850,
        "lng": 5.5228
    },
    {
        "name": "Tébessa",
        "lat": 35.4042,
        "lng": 8.1242
    },
    {
        "name": "Tiaret",
        "lat": 35.3710,
        "lng": 1.3160
    },
    {
        "name": "Timimoun",
        "lat": 29.2639,
        "lng": 0.2306
    },
    {
        "name": "Tindouf",
        "lat": 27.6711,
        "lng": -8.1474
    },
    {
        "name": "Tipaza",
        "lat": 36.5897,
        "lng": 2.4481
    },
    {
        "name": "Tissemsilt",
        "lat": 35.6072,
        "lng": 1.8108
    },
    {
        "name": "Tizi Ouzou",
        "lat": 36.7118,
        "lng": 4.0459
    },
    {
        "name": "Tlemcen",
        "lat": 34.8828,
        "lng": -1.3167
    },
    {
        "name": "Touggourt",
        "lat": 33.1000,
        "lng": 6.0667
    },
    {
        "name": "Djanet",
        "lat": 24.5540,
        "lng": 9.4840
    }
],

"AD": [
    {
        "name": "Canillo",
        "lat": 42.5667,
        "lng": 1.6000
    },
    {
        "name": "Encamp",
        "lat": 42.5333,
        "lng": 1.5833
    },
    {
        "name": "La Massana",
        "lat": 42.5440,
        "lng": 1.5148
    },
    {
        "name": "Ordino",
        "lat": 42.5562,
        "lng": 1.5332
    },
    {
        "name": "Sant Julià de Lòria",
        "lat": 42.4637,
        "lng": 1.4913
    },
    {
        "name": "Andorra la Vella",
        "lat": 42.5063,
        "lng": 1.5218
    },
    {
        "name": "Escaldes-Engordany",
        "lat": 42.5095,
        "lng": 1.5386
    }
],

"AO": [
    {
        "name": "Bengo",
        "lat": -9.0000,
        "lng": 13.5000
    },
    {
        "name": "Benguela",
        "lat": -12.5763,
        "lng": 13.4055
    },
    {
        "name": "Bié",
        "lat": -12.0000,
        "lng": 17.0000
    },
    {
        "name": "Cabinda",
        "lat": -5.5500,
        "lng": 12.1900
    },
    {
        "name": "Cuando Cubango",
        "lat": -16.0000,
        "lng": 19.0000
    },
    {
        "name": "Cuanza Norte",
        "lat": -9.0000,
        "lng": 14.8000
    },
    {
        "name": "Cuanza Sul",
        "lat": -10.9000,
        "lng": 14.9000
    },
    {
        "name": "Cunene",
        "lat": -17.3000,
        "lng": 15.7000
    },
    {
        "name": "Huambo",
        "lat": -12.7761,
        "lng": 15.7392
    },
    {
        "name": "Huíla",
        "lat": -14.9000,
        "lng": 14.9000
    },
    {
        "name": "Icolo e Bengo",
        "lat": -9.2500,
        "lng": 13.8000
    },
    {
        "name": "Luanda",
        "lat": -8.8390,
        "lng": 13.2894
    },
    {
        "name": "Lunda Norte",
        "lat": -8.5000,
        "lng": 20.5000
    },
    {
        "name": "Lunda Sul",
        "lat": -10.5000,
        "lng": 21.0000
    },
    {
        "name": "Malanje",
        "lat": -9.5402,
        "lng": 16.3410
    },
    {
        "name": "Moxico",
        "lat": -13.5000,
        "lng": 21.0000
    },
    {
        "name": "Moxico Leste",
        "lat": -14.0000,
        "lng": 22.5000
    },
    {
        "name": "Namibe",
        "lat": -15.1961,
        "lng": 12.1522
    },
    {
        "name": "Uíge",
        "lat": -7.6087,
        "lng": 15.0613
    },
    {
        "name": "Zaire",
        "lat": -6.2700,
        "lng": 13.2300
    }
],

"AG": [
    {
        "name": "Saint John",
        "lat": 17.1172,
        "lng": -61.8457
    },
    {
        "name": "Saint Mary",
        "lat": 17.0167,
        "lng": -61.8500
    },
    {
        "name": "Saint Paul",
        "lat": 17.0500,
        "lng": -61.8000
    },
    {
        "name": "Saint Peter",
        "lat": 17.0833,
        "lng": -61.8000
    },
    {
        "name": "Saint Philip",
        "lat": 17.0667,
        "lng": -61.7167
    },
    {
        "name": "Barbuda",
        "lat": 17.6268,
        "lng": -61.7710
    },
    {
        "name": "Redonda",
        "lat": 16.9380,
        "lng": -62.3450
    }
],

"AM": [
    {
        "name": "Aragatsotn",
        "lat": 40.4030,
        "lng": 44.0470
    },
    {
        "name": "Ararat",
        "lat": 39.9139,
        "lng": 44.7281
    },
    {
        "name": "Armavir",
        "lat": 40.1500,
        "lng": 44.0400
    },
    {
        "name": "Gegharkunik",
        "lat": 40.2500,
        "lng": 45.2500
    },
    {
        "name": "Kotayk",
        "lat": 40.3333,
        "lng": 44.7500
    },
    {
        "name": "Lori",
        "lat": 40.9500,
        "lng": 44.5000
    },
    {
        "name": "Shirak",
        "lat": 40.7667,
        "lng": 43.8333
    },
    {
        "name": "Syunik",
        "lat": 39.2500,
        "lng": 46.2500
    },
    {
        "name": "Tavush",
        "lat": 40.8833,
        "lng": 45.3333
    },
    {
        "name": "Vayots Dzor",
        "lat": 39.7500,
        "lng": 45.3333
    },
    {
        "name": "Yerevan",
        "lat": 40.1872,
        "lng": 44.5152
    }
],

"AR": [
    {
        "name": "Buenos Aires",
        "lat": -34.9215,
        "lng": -57.9545
    },
    {
        "name": "Catamarca",
        "lat": -28.4696,
        "lng": -65.7852
    },
    {
        "name": "Chaco",
        "lat": -27.4514,
        "lng": -58.9867
    },
    {
        "name": "Chubut",
        "lat": -43.3000,
        "lng": -65.1000
    },
    {
        "name": "Córdoba",
        "lat": -31.4201,
        "lng": -64.1888
    },
    {
        "name": "Corrientes",
        "lat": -27.4692,
        "lng": -58.8306
    },
    {
        "name": "Entre Ríos",
        "lat": -31.7333,
        "lng": -60.5297
    },
    {
        "name": "Formosa",
        "lat": -26.1849,
        "lng": -58.1731
    },
    {
        "name": "Jujuy",
        "lat": -24.1858,
        "lng": -65.2995
    },
    {
        "name": "La Pampa",
        "lat": -36.6167,
        "lng": -64.2833
    },
    {
        "name": "La Rioja",
        "lat": -29.4135,
        "lng": -66.8562
    },
    {
        "name": "Mendoza",
        "lat": -32.8895,
        "lng": -68.8458
    },
    {
        "name": "Misiones",
        "lat": -27.3621,
        "lng": -55.9009
    },
    {
        "name": "Neuquén",
        "lat": -38.9516,
        "lng": -68.0591
    },
    {
        "name": "Río Negro",
        "lat": -40.8000,
        "lng": -63.0000
    },
    {
        "name": "Salta",
        "lat": -24.7821,
        "lng": -65.4232
    },
    {
        "name": "San Juan",
        "lat": -31.5375,
        "lng": -68.5364
    },
    {
        "name": "San Luis",
        "lat": -33.3017,
        "lng": -66.3378
    },
    {
        "name": "Santa Cruz",
        "lat": -50.3333,
        "lng": -69.2500
    },
    {
        "name": "Santa Fe",
        "lat": -31.6333,
        "lng": -60.7000
    },
    {
        "name": "Santiago del Estero",
        "lat": -27.7951,
        "lng": -64.2615
    },
    {
        "name": "Tierra del Fuego",
        "lat": -54.8019,
        "lng": -68.3029
    },
    {
        "name": "Tucumán",
        "lat": -26.8083,
        "lng": -65.2176
    }
],

"AU": [
    {
        "name": "Australian Capital Territory",
        "lat": -35.2809,
        "lng": 149.1300
    },
    {
        "name": "New South Wales",
        "lat": -33.8688,
        "lng": 151.2093
    },
    {
        "name": "Northern Territory",
        "lat": -12.4634,
        "lng": 130.8456
    },
    {
        "name": "Queensland",
        "lat": -27.4698,
        "lng": 153.0251
    },
    {
        "name": "South Australia",
        "lat": -34.9285,
        "lng": 138.6007
    },
    {
        "name": "Tasmania",
        "lat": -42.8821,
        "lng": 147.3272
    },
    {
        "name": "Victoria",
        "lat": -37.8136,
        "lng": 144.9631
    },
    {
        "name": "Western Australia",
        "lat": -31.9505,
        "lng": 115.8605
    }
],

"AT": [
    {
        "name": "Burgenland",
        "lat": 47.5000,
        "lng": 16.5000
    },
    {
        "name": "Carinthia",
        "lat": 46.7000,
        "lng": 14.2000
    },
    {
        "name": "Lower Austria",
        "lat": 48.2000,
        "lng": 15.6000
    },
    {
        "name": "Upper Austria",
        "lat": 48.2000,
        "lng": 14.0000
    },
    {
        "name": "Salzburg",
        "lat": 47.8000,
        "lng": 13.0500
    },
    {
        "name": "Styria",
        "lat": 47.2500,
        "lng": 15.0000
    },
    {
        "name": "Tyrol",
        "lat": 47.2500,
        "lng": 11.4000
    },
    {
        "name": "Vorarlberg",
        "lat": 47.2500,
        "lng": 9.9000
    },
    {
        "name": "Vienna",
        "lat": 48.2082,
        "lng": 16.3738
    }
],

"AZ": [
    {
        "name": "Absheron",
        "lat": 40.4500,
        "lng": 49.7500
    },
    {
        "name": "Agdam",
        "lat": 39.9900,
        "lng": 46.9300
    },
    {
        "name": "Agdash",
        "lat": 40.6500,
        "lng": 47.4800
    },
    {
        "name": "Agjabadi",
        "lat": 40.0500,
        "lng": 47.4600
    },
    {
        "name": "Astara",
        "lat": 38.4560,
        "lng": 48.8760
    },
    {
        "name": "Baku",
        "lat": 40.4093,
        "lng": 49.8671
    },
    {
        "name": "Balakan",
        "lat": 41.7250,
        "lng": 46.4080
    },
    {
        "name": "Barda",
        "lat": 40.3750,
        "lng": 47.1260
    },
    {
        "name": "Beylagan",
        "lat": 39.7750,
        "lng": 47.6180
    },
    {
        "name": "Bilasuvar",
        "lat": 39.4590,
        "lng": 48.5530
    },
    {
        "name": "Dashkasan",
        "lat": 40.5200,
        "lng": 46.0750
    },
    {
        "name": "Fizuli",
        "lat": 39.6000,
        "lng": 47.1450
    },
    {
        "name": "Ganja",
        "lat": 40.6828,
        "lng": 46.3606
    },
    {
        "name": "Gadabay",
        "lat": 40.5650,
        "lng": 45.8160
    },
    {
        "name": "Goranboy",
        "lat": 40.6100,
        "lng": 46.7900
    },
    {
        "name": "Goychay",
        "lat": 40.6200,
        "lng": 47.7400
    },
    {
        "name": "Hajigabul",
        "lat": 40.0400,
        "lng": 48.9400
    },
    {
        "name": "Imishli",
        "lat": 39.8700,
        "lng": 48.0600
    },
    {
        "name": "Ismayilli",
        "lat": 40.7900,
        "lng": 48.1500
    },
    {
        "name": "Jalilabad",
        "lat": 39.2100,
        "lng": 48.5100
    },
    {
        "name": "Jabrayil",
        "lat": 39.4000,
        "lng": 47.0300
    },
    {
        "name": "Julfa",
        "lat": 38.9600,
        "lng": 45.6300
    },
    {
        "name": "Kalbajar",
        "lat": 40.1000,
        "lng": 46.0400
    },
    {
        "name": "Khachmaz",
        "lat": 41.4700,
        "lng": 48.8000
    },{
        "name": "Khizi",
        "lat": 40.9100,
        "lng": 49.0800
    },
    {
        "name": "Kurdamir",
        "lat": 40.3400,
        "lng": 48.1600
    },
    {
        "name": "Lachin",
        "lat": 39.6400,
        "lng": 46.5500
    },
    {
        "name": "Lankaran",
        "lat": 38.7536,
        "lng": 48.8511
    },
    {
        "name": "Lerik",
        "lat": 38.7730,
        "lng": 48.4150
    },
    {
        "name": "Masally",
        "lat": 39.0300,
        "lng": 48.6700
    },
    {
        "name": "Mingachevir",
        "lat": 40.7700,
        "lng": 47.0500
    },
    {
        "name": "Nakhchivan",
        "lat": 39.2089,
        "lng": 45.4122
    },
    {
        "name": "Neftchala",
        "lat": 39.3600,
        "lng": 49.2500
    },
    {
        "name": "Oghuz",
        "lat": 41.0700,
        "lng": 47.4600
    },
    {
        "name": "Qabala",
        "lat": 40.9814,
        "lng": 47.8458
    },
    {
        "name": "Qakh",
        "lat": 41.4200,
        "lng": 46.9200
    },
    {
        "name": "Qazakh",
        "lat": 41.0900,
        "lng": 45.3700
    },
    {
        "name": "Quba",
        "lat": 41.3600,
        "lng": 48.5100
    },
    {
        "name": "Qusar",
        "lat": 41.4264,
        "lng": 48.4356
    },
    {
        "name": "Saatly",
        "lat": 39.9300,
        "lng": 48.3700
    },
    {
        "name": "Sabirabad",
        "lat": 40.0100,
        "lng": 48.4800
    },
    {
        "name": "Salyan",
        "lat": 39.5962,
        "lng": 48.9848
    },
    {
        "name": "Samukh",
        "lat": 40.7800,
        "lng": 46.4100
    },
    {
        "name": "Shabran",
        "lat": 41.2000,
        "lng": 48.9800
    },
    {
        "name": "Shaki",
        "lat": 41.1919,
        "lng": 47.1706
    },
    {
        "name": "Shamakhi",
        "lat": 40.6300,
        "lng": 48.6400
    },
    {
        "name": "Shamkir",
        "lat": 40.8290,
        "lng": 46.0170
    },
    {
        "name": "Shusha",
        "lat": 39.7600,
        "lng": 46.7500
    },
    {
        "name": "Siazan",
        "lat": 41.0780,
        "lng": 49.1100
    },
    {
        "name": "Tartar",
        "lat": 40.3450,
        "lng": 46.9300
    },
    {
        "name": "Tovuz",
        "lat": 40.9920,
        "lng": 45.6280
    },
    {
        "name": "Ujar",
        "lat": 40.5200,
        "lng": 47.6500
    },
    {
        "name": "Yardimli",
        "lat": 38.9100,
        "lng": 48.2400
    },
    {
        "name": "Yevlakh",
        "lat": 40.6170,
        "lng": 47.1500
    },
    {
        "name": "Zaqatala",
        "lat": 41.6300,
        "lng": 46.6400
    },
    {
        "name": "Zangilan",
        "lat": 39.0850,
        "lng": 46.6500
    },
    {
        "name": "Zardab",
        "lat": 40.2180,
        "lng": 47.7120
    }
],
    "US": [
        {
            "name": "Alabama",
            "lat": 32.8067,
            "lng": -86.7911
        },
        {
            "name": "Alaska",
            "lat": 61.3707,
            "lng": -152.4044
        },
        {
            "name": "Arizona",
            "lat": 33.7298,
            "lng": -111.4312
        },
        {
            "name": "Arkansas",
            "lat": 34.9697,
            "lng": -92.3731
        },
        {
            "name": "California",
            "lat": 38.5767,
            "lng": -121.4944
        },
        {
            "name": "Colorado",
            "lat": 39.0598,
            "lng": -105.3111
        },
        {
            "name": "Connecticut",
            "lat": 41.5978,
            "lng": -72.7554
        },
        {
            "name": "Delaware",
            "lat": 39.3185,
            "lng": -75.5071
        },
        {
            "name": "Florida",
            "lat": 27.7663,
            "lng": -81.6868
        },
        {
            "name": "Georgia",
            "lat": 33.0406,
            "lng": -83.6431
        },
        {
            "name": "Hawaii",
            "lat": 21.0943,
            "lng": -157.4983
        },
        {
            "name": "Idaho",
            "lat": 44.2405,
            "lng": -114.4788
        },
        {
            "name": "Illinois",
            "lat": 40.3495,
            "lng": -88.9861
        },
        {
            "name": "Indiana",
            "lat": 39.8494,
            "lng": -86.2583
        },
        {
            "name": "Iowa",
            "lat": 42.0115,
            "lng": -93.2105
        },
        {
            "name": "Kansas",
            "lat": 38.5266,
            "lng": -96.7265
        },
        {
            "name": "Kentucky",
            "lat": 37.6681,
            "lng": -84.6701
        },
        {
            "name": "Louisiana",
            "lat": 31.1695,
            "lng": -91.8678
        },
        {
            "name": "Maine",
            "lat": 44.6939,
            "lng": -69.3819
        },
        {
            "name": "Maryland",
            "lat": 39.0639,
            "lng": -76.8021
        },
        {
            "name": "Massachusetts",
            "lat": 42.2302,
            "lng": -71.5301
        },
        {
            "name": "Michigan",
            "lat": 43.3266,
            "lng": -84.5361
        },
        {
            "name": "Minnesota",
            "lat": 45.6945,
            "lng": -93.9002
        },
        {
            "name": "Mississippi",
            "lat": 32.7416,
            "lng": -89.6787
        },
        {
            "name": "Missouri",
            "lat": 38.4561,
            "lng": -92.2884
        },
        {
            "name": "Montana",
            "lat": 46.9219,
            "lng": -110.4544
        },
        {
            "name": "Nebraska",
            "lat": 41.1254,
            "lng": -98.2681
        },
        {
            "name": "Nevada",
            "lat": 38.3135,
            "lng": -117.0554
        },
        {
            "name": "New Hampshire",
            "lat": 43.4525,
            "lng": -71.5639
        },
        {
            "name": "New Jersey",
            "lat": 40.2989,
            "lng": -74.521
        },
        {
            "name": "New Mexico",
            "lat": 34.8405,
            "lng": -106.2485
        },
        {
            "name": "New York",
            "lat": 42.1657,
            "lng": -74.9481
        },
        {
            "name": "North Carolina",
            "lat": 35.6301,
            "lng": -79.8064
        },
        {
            "name": "North Dakota",
            "lat": 47.5289,
            "lng": -99.784
        },
        {
            "name": "Ohio",
            "lat": 40.3888,
            "lng": -82.7649
        },
        {
            "name": "Oklahoma",
            "lat": 35.5653,
            "lng": -96.9289
        },
        {
            "name": "Oregon",
            "lat": 44.572,
            "lng": -122.0709
        },
        {
            "name": "Pennsylvania",
            "lat": 40.5908,
            "lng": -77.2098
        },
        {
            "name": "Rhode Island",
            "lat": 41.6809,
            "lng": -71.5118
        },
        {
            "name": "South Carolina",
            "lat": 33.8569,
            "lng": -80.8964
        },
        {
            "name": "South Dakota",
            "lat": 44.2998,
            "lng": -99.4388
        },
        {
            "name": "Tennessee",
            "lat": 35.7478,
            "lng": -86.6923
        },
        {
            "name": "Texas",
            "lat": 31.0545,
            "lng": -97.5635
        },
        {
            "name": "Utah",
            "lat": 40.15,
            "lng": -111.8624
        },
        {
            "name": "Vermont",
            "lat": 44.0459,
            "lng": -72.7107
        },
        {
            "name": "Virginia",
            "lat": 37.7693,
            "lng": -78.17
        },
        {
            "name": "Washington",
            "lat": 47.4009,
            "lng": -121.4905
        },
        {
            "name": "West Virginia",
            "lat": 38.4912,
            "lng": -80.9545
        },
        {
            "name": "Wisconsin",
            "lat": 44.2685,
            "lng": -89.6165
        },
        {
            "name": "Wyoming",
            "lat": 42.756,
            "lng": -107.3025
        }
    ],
    "CA": [
        {
            "name": "Alberta",
            "lat": 53.9333,
            "lng": -116.5765
        },
        {
            "name": "British Columbia",
            "lat": 53.7267,
            "lng": -127.6476
        },
        {
            "name": "Manitoba",
            "lat": 53.7609,
            "lng": -98.8139
        },
        {
            "name": "New Brunswick",
            "lat": 46.5653,
            "lng": -66.4619
        },
        {
            "name": "Newfoundland and Labrador",
            "lat": 53.1355,
            "lng": -57.6604
        },
        {
            "name": "Nova Scotia",
            "lat": 44.682,
            "lng": -63.7443
        },
        {
            "name": "Ontario",
            "lat": 51.2538,
            "lng": -85.3232
        },
        {
            "name": "Prince Edward Island",
            "lat": 46.5107,
            "lng": -63.4168
        },
        {
            "name": "Quebec",
            "lat": 52.9399,
            "lng": -73.5491
        },
        {
            "name": "Saskatchewan",
            "lat": 52.9399,
            "lng": -106.4509
        },
        {
            "name": "Northwest Territories",
            "lat": 64.8255,
            "lng": -124.8457
        },
        {
            "name": "Nunavut",
            "lat": 70.2998,
            "lng": -83.1076
        },
        {
            "name": "Yukon",
            "lat": 64.2823,
            "lng": -135.0
        }
    ],
    "GB": [
        {
            "name": "England",
            "lat": 52.3555,
            "lng": -1.1743
        },
        {
            "name": "Scotland",
            "lat": 56.4907,
            "lng": -4.2026
        },
        {
            "name": "Wales",
            "lat": 52.1307,
            "lng": -3.7837
        },
        {
            "name": "Northern Ireland",
            "lat": 54.7877,
            "lng": -6.4923
        }
    ],
    "AU": [
        {
            "name": "New South Wales",
            "lat": -31.2532,
            "lng": 146.9211
        },
        {
            "name": "Victoria",
            "lat": -36.9848,
            "lng": 143.3906
        },
        {
            "name": "Queensland",
            "lat": -20.9176,
            "lng": 142.7028
        },
        {
            "name": "Western Australia",
            "lat": -25.0423,
            "lng": 121.6417
        },
        {
            "name": "South Australia",
            "lat": -30.0002,
            "lng": 136.2092
        },
        {
            "name": "Tasmania",
            "lat": -41.4545,
            "lng": 145.9707
        },
        {
            "name": "Northern Territory",
            "lat": -19.4914,
            "lng": 132.5509
        },
        {
            "name": "Australian Capital Territory",
            "lat": -35.4735,
            "lng": 149.0124
        }
    ],
    "IN": [
        {
            "name": "Andhra Pradesh",
            "lat": 15.9129,
            "lng": 79.74
        },
        {
            "name": "Arunachal Pradesh",
            "lat": 28.218,
            "lng": 94.7278
        },
        {
            "name": "Assam",
            "lat": 26.2006,
            "lng": 92.9376
        },
        {
            "name": "Bihar",
            "lat": 25.0961,
            "lng": 85.3131
        },
        {
            "name": "Chhattisgarh",
            "lat": 21.2787,
            "lng": 81.8661
        },
        {
            "name": "Goa",
            "lat": 15.2993,
            "lng": 74.124
        },
        {
            "name": "Gujarat",
            "lat": 22.2587,
            "lng": 71.1924
        },
        {
            "name": "Haryana",
            "lat": 29.0588,
            "lng": 76.0856
        },
        {
            "name": "Himachal Pradesh",
            "lat": 31.1048,
            "lng": 77.1734
        },
        {
            "name": "Jharkhand",
            "lat": 23.6102,
            "lng": 85.2799
        },
        {
            "name": "Karnataka",
            "lat": 15.3173,
            "lng": 75.7139
        },
        {
            "name": "Kerala",
            "lat": 10.8505,
            "lng": 76.2711
        },
        {
            "name": "Madhya Pradesh",
            "lat": 22.9734,
            "lng": 78.6569
        },
        {
            "name": "Maharashtra",
            "lat": 19.7515,
            "lng": 75.7139
        },
        {
            "name": "Manipur",
            "lat": 24.6637,
            "lng": 93.9063
        },
        {
            "name": "Meghalaya",
            "lat": 25.467,
            "lng": 91.3662
        },
        {
            "name": "Mizoram",
            "lat": 23.1645,
            "lng": 92.9376
        },
        {
            "name": "Nagaland",
            "lat": 26.1584,
            "lng": 94.5624
        },
        {
            "name": "Odisha",
            "lat": 20.9517,
            "lng": 85.0985
        },
        {
            "name": "Punjab",
            "lat": 31.1471,
            "lng": 75.3412
        },
        {
            "name": "Rajasthan",
            "lat": 27.0238,
            "lng": 74.2179
        },
        {
            "name": "Sikkim",
            "lat": 27.533,
            "lng": 88.5122
        },
        {
            "name": "Tamil Nadu",
            "lat": 11.1271,
            "lng": 78.6569
        },
        {
            "name": "Telangana",
            "lat": 18.1124,
            "lng": 79.0193
        },
        {
            "name": "Tripura",
            "lat": 23.9408,
            "lng": 91.9882
        },
        {
            "name": "Uttar Pradesh",
            "lat": 26.8467,
            "lng": 80.9462
        },
        {
            "name": "Uttarakhand",
            "lat": 30.0668,
            "lng": 79.0193
        },
        {
            "name": "West Bengal",
            "lat": 22.9868,
            "lng": 87.855
        },
        {
            "name": "Delhi",
            "lat": 28.7041,
            "lng": 77.1025
        },
        {
            "name": "Jammu and Kashmir",
            "lat": 33.7782,
            "lng": 76.5762
        }
    ],
    "CN": [
        {
            "name": "Beijing",
            "lat": 39.9042,
            "lng": 116.4074
        },
        {
            "name": "Shanghai",
            "lat": 31.2304,
            "lng": 121.4737
        },
        {
            "name": "Guangdong",
            "lat": 23.379,
            "lng": 113.7633
        },
        {
            "name": "Sichuan",
            "lat": 30.6171,
            "lng": 102.7103
        },
        {
            "name": "Hubei",
            "lat": 30.9756,
            "lng": 112.2707
        },
        {
            "name": "Zhejiang",
            "lat": 29.1416,
            "lng": 119.7889
        },
        {
            "name": "Jiangsu",
            "lat": 32.9711,
            "lng": 119.455
        },
        {
            "name": "Fujian",
            "lat": 26.1008,
            "lng": 117.635
        },
        {
            "name": "Shandong",
            "lat": 36.3427,
            "lng": 118.1498
        },
        {
            "name": "Henan",
            "lat": 34.7657,
            "lng": 113.7532
        },
        {
            "name": "Hebei",
            "lat": 39.549,
            "lng": 115.665
        },
        {
            "name": "Hunan",
            "lat": 27.6104,
            "lng": 111.7088
        },
        {
            "name": "Anhui",
            "lat": 31.8257,
            "lng": 117.2264
        },
        {
            "name": "Jiangxi",
            "lat": 27.614,
            "lng": 115.7221
        },
        {
            "name": "Liaoning",
            "lat": 41.2956,
            "lng": 122.6085
        },
        {
            "name": "Yunnan",
            "lat": 24.974,
            "lng": 101.487
        },
        {
            "name": "Guangxi",
            "lat": 23.7248,
            "lng": 108.8076
        },
        {
            "name": "Chongqing",
            "lat": 29.4316,
            "lng": 106.9123
        },
        {
            "name": "Tianjin",
            "lat": 39.3434,
            "lng": 117.3616
        },
        {
            "name": "Shaanxi",
            "lat": 35.393,
            "lng": 109.188
        },
        {
            "name": "Jilin",
            "lat": 43.6661,
            "lng": 126.1923
        },
        {
            "name": "Heilongjiang",
            "lat": 47.8619,
            "lng": 127.7615
        },
        {
            "name": "Shanxi",
            "lat": 37.5777,
            "lng": 112.2922
        },
        {
            "name": "Gansu",
            "lat": 36.0611,
            "lng": 103.8343
        },
        {
            "name": "Inner Mongolia",
            "lat": 44.0939,
            "lng": 113.9448
        },
        {
            "name": "Xinjiang",
            "lat": 41.1129,
            "lng": 85.2401
        },
        {
            "name": "Tibet",
            "lat": 31.65,
            "lng": 88.0924
        },
        {
            "name": "Qinghai",
            "lat": 35.7452,
            "lng": 95.9956
        },
        {
            "name": "Ningxia",
            "lat": 37.1987,
            "lng": 106.1581
        },
        {
            "name": "Hainan",
            "lat": 19.5664,
            "lng": 109.9497
        },
        {
            "name": "Guizhou",
            "lat": 26.842,
            "lng": 107.2903
        }
    ],
    "BR": [
        {
            "name": "Acre",
            "lat": -9.0238,
            "lng": -70.812
        },
        {
            "name": "Alagoas",
            "lat": -9.5713,
            "lng": -36.782
        },
        {
            "name": "Amapa",
            "lat": 1.4102,
            "lng": -51.77
        },
        {
            "name": "Amazonas",
            "lat": -3.4168,
            "lng": -65.8561
        },
        {
            "name": "Bahia",
            "lat": -12.5797,
            "lng": -41.7007
        },
        {
            "name": "Ceara",
            "lat": -5.4984,
            "lng": -39.3206
        },
        {
            "name": "Distrito Federal",
            "lat": -15.7998,
            "lng": -47.8645
        },
        {
            "name": "Espirito Santo",
            "lat": -19.1834,
            "lng": -40.3089
        },
        {
            "name": "Goias",
            "lat": -15.827,
            "lng": -49.8362
        },
        {
            "name": "Maranhao",
            "lat": -5.2086,
            "lng": -45.393
        },
        {
            "name": "Mato Grosso",
            "lat": -12.6819,
            "lng": -56.9211
        },
        {
            "name": "Mato Grosso do Sul",
            "lat": -20.7722,
            "lng": -54.7852
        },
        {
            "name": "Minas Gerais",
            "lat": -18.5122,
            "lng": -44.555
        },
        {
            "name": "Para",
            "lat": -1.9981,
            "lng": -54.9306
        },
        {
            "name": "Paraiba",
            "lat": -7.2399,
            "lng": -36.7819
        },
        {
            "name": "Parana",
            "lat": -25.2521,
            "lng": -52.0215
        },
        {
            "name": "Pernambuco",
            "lat": -8.8137,
            "lng": -36.9541
        },
        {
            "name": "Piaui",
            "lat": -7.7183,
            "lng": -42.7289
        },
        {
            "name": "Rio de Janeiro",
            "lat": -22.9068,
            "lng": -43.1729
        },
        {
            "name": "Rio Grande do Norte",
            "lat": -5.4026,
            "lng": -36.9541
        },
        {
            "name": "Rio Grande do Sul",
            "lat": -30.0346,
            "lng": -51.2177
        },
        {
            "name": "Rondonia",
            "lat": -11.5057,
            "lng": -63.5806
        },
        {
            "name": "Roraima",
            "lat": 2.7376,
            "lng": -62.0751
        },
        {
            "name": "Santa Catarina",
            "lat": -27.2423,
            "lng": -50.2189
        },
        {
            "name": "Sao Paulo",
            "lat": -23.5505,
            "lng": -46.6333
        },
        {
            "name": "Sergipe",
            "lat": -10.5741,
            "lng": -37.3857
        },
        {
            "name": "Tocantins",
            "lat": -10.1753,
            "lng": -48.2982
        }
    ],
    "DE": [
        {
            "name": "Bavaria",
            "lat": 48.7904,
            "lng": 11.4979
        },
        {
            "name": "Berlin",
            "lat": 52.52,
            "lng": 13.405
        },
        {
            "name": "Brandenburg",
            "lat": 52.4125,
            "lng": 12.5316
        },
        {
            "name": "Hesse",
            "lat": 50.6521,
            "lng": 9.1624
        },
        {
            "name": "Hamburg",
            "lat": 53.5511,
            "lng": 9.9937
        },
        {
            "name": "Lower Saxony",
            "lat": 52.6367,
            "lng": 9.8451
        },
        {
            "name": "North Rhine-Westphalia",
            "lat": 51.4332,
            "lng": 7.6616
        },
        {
            "name": "Rhineland-Palatinate",
            "lat": 50.1188,
            "lng": 7.3086
        },
        {
            "name": "Saxony",
            "lat": 51.1045,
            "lng": 13.2017
        },
        {
            "name": "Saxony-Anhalt",
            "lat": 51.9503,
            "lng": 11.6923
        },
        {
            "name": "Thuringia",
            "lat": 51.011,
            "lng": 10.8453
        },
        {
            "name": "Baden-Wurttemberg",
            "lat": 48.6616,
            "lng": 9.3501
        },
        {
            "name": "Bremen",
            "lat": 53.0793,
            "lng": 8.8017
        },
        {
            "name": "Mecklenburg-Vorpommern",
            "lat": 53.6127,
            "lng": 12.4296
        },
        {
            "name": "Saarland",
            "lat": 49.3964,
            "lng": 7.022
        },
        {
            "name": "Schleswig-Holstein",
            "lat": 54.2194,
            "lng": 9.6961
        }
    ],
    "FR": [
        {
            "name": "Ile-de-France",
            "lat": 48.8499,
            "lng": 2.637
        },
        {
            "name": "Auvergne-Rhone-Alpes",
            "lat": 45.4479,
            "lng": 4.3853
        },
        {
            "name": "Bourgogne-Franche-Comte",
            "lat": 47.2805,
            "lng": 4.9994
        },
        {
            "name": "Brittany",
            "lat": 48.202,
            "lng": -2.9326
        },
        {
            "name": "Centre-Val de Loire",
            "lat": 47.7516,
            "lng": 1.6751
        },
        {
            "name": "Corsica",
            "lat": 42.0396,
            "lng": 9.0129
        },
        {
            "name": "Grand Est",
            "lat": 48.6998,
            "lng": 6.1878
        },
        {
            "name": "Hauts-de-France",
            "lat": 50.4801,
            "lng": 2.7937
        },
        {
            "name": "Normandy",
            "lat": 49.1829,
            "lng": -0.3707
        },
        {
            "name": "Nouvelle-Aquitaine",
            "lat": 45.7088,
            "lng": 0.6263
        },
        {
            "name": "Occitanie",
            "lat": 43.8927,
            "lng": 3.2828
        },
        {
            "name": "Pays de la Loire",
            "lat": 47.7633,
            "lng": -0.3299
        },
        {
            "name": "Provence-Alpes-Cote d'Azur",
            "lat": 43.9352,
            "lng": 6.0679
        }
    ],
    "ZA": [
        {
            "name": "Eastern Cape",
            "lat": -31.0,
            "lng": 26.0
        },
        {
            "name": "Free State",
            "lat": -28.4541,
            "lng": 26.7968
        },
        {
            "name": "Gauteng",
            "lat": -26.2708,
            "lng": 28.1123
        },
        {
            "name": "KwaZulu-Natal",
            "lat": -29.0,
            "lng": 30.0
        },
        {
            "name": "Limpopo",
            "lat": -23.4013,
            "lng": 29.4179
        },
        {
            "name": "Mpumalanga",
            "lat": -25.5653,
            "lng": 30.5279
        },
        {
            "name": "Northern Cape",
            "lat": -29.0467,
            "lng": 21.8569
        },
        {
            "name": "North West",
            "lat": -26.6639,
            "lng": 25.2838
        },
        {
            "name": "Western Cape",
            "lat": -33.2278,
            "lng": 21.8569
        }
    ],
    "MX": [
        {
            "name": "Aguascalientes",
            "lat": 21.8853,
            "lng": -102.2916
        },
        {
            "name": "Baja California",
            "lat": 30.8406,
            "lng": -115.2838
        },
        {
            "name": "Baja California Sur",
            "lat": 26.0444,
            "lng": -111.6661
        },
        {
            "name": "Campeche",
            "lat": 19.8301,
            "lng": -90.5349
        },
        {
            "name": "Chiapas",
            "lat": 16.7569,
            "lng": -93.1292
        },
        {
            "name": "Chihuahua",
            "lat": 28.632,
            "lng": -106.0691
        },
        {
            "name": "Coahuila",
            "lat": 27.0587,
            "lng": -101.7068
        },
        {
            "name": "Colima",
            "lat": 19.2452,
            "lng": -103.7241
        },
        {
            "name": "Durango",
            "lat": 24.5593,
            "lng": -104.6588
        },
        {
            "name": "Guanajuato",
            "lat": 21.019,
            "lng": -101.2574
        },
        {
            "name": "Guerrero",
            "lat": 17.4392,
            "lng": -99.5451
        },
        {
            "name": "Hidalgo",
            "lat": 20.0911,
            "lng": -98.7624
        },
        {
            "name": "Jalisco",
            "lat": 20.6595,
            "lng": -103.3494
        },
        {
            "name": "Mexico State",
            "lat": 19.4969,
            "lng": -99.7233
        },
        {
            "name": "Michoacan",
            "lat": 19.5665,
            "lng": -101.7068
        },
        {
            "name": "Morelos",
            "lat": 18.6813,
            "lng": -99.1013
        },
        {
            "name": "Nayarit",
            "lat": 21.7514,
            "lng": -104.8455
        },
        {
            "name": "Nuevo Leon",
            "lat": 25.5922,
            "lng": -99.9962
        },
        {
            "name": "Oaxaca",
            "lat": 17.0732,
            "lng": -96.7266
        },
        {
            "name": "Puebla",
            "lat": 19.0414,
            "lng": -98.2063
        },
        {
            "name": "Queretaro",
            "lat": 20.5888,
            "lng": -100.3899
        },
        {
            "name": "Quintana Roo",
            "lat": 19.1817,
            "lng": -88.4791
        },
        {
            "name": "San Luis Potosi",
            "lat": 22.1565,
            "lng": -100.9855
        },
        {
            "name": "Sinaloa",
            "lat": 25.1721,
            "lng": -107.4795
        },
        {
            "name": "Sonora",
            "lat": 29.2972,
            "lng": -110.3309
        },
        {
            "name": "Tabasco",
            "lat": 17.8409,
            "lng": -92.6189
        },
        {
            "name": "Tamaulipas",
            "lat": 24.2669,
            "lng": -98.8363
        },
        {
            "name": "Tlaxcala",
            "lat": 19.3139,
            "lng": -98.2404
        },
        {
            "name": "Veracruz",
            "lat": 19.1738,
            "lng": -96.1342
        },
        {
            "name": "Yucatan",
            "lat": 20.7099,
            "lng": -89.0943
        },
        {
            "name": "Zacatecas",
            "lat": 22.7709,
            "lng": -102.5832
        }
    ]
};

export function getRegions(countryCode) {
    return REGIONS[String(countryCode || "").trim().toUpperCase()] || [];
}

export function getRegion(countryCode, regionName) {
    const list = getRegions(countryCode);
    const wanted = String(regionName || "").trim().toLowerCase();
    return list.find(r => r.name.toLowerCase() === wanted) || null;
}

export function calculateRegionDistance(countryCode, fromRegion, toRegion) {
    if (!fromRegion || !toRegion) return 0;

    const from = getRegion(countryCode, fromRegion);
    const to = getRegion(countryCode, toRegion);

    if (!from || !to) return 0;
    if (from.name.toLowerCase() === to.name.toLowerCase()) return 20;

    // 1.25 is an estimated road-distance factor over straight-line distance.
    return Math.max(
        20,
        Math.round(haversineKm(from.lat, from.lng, to.lat, to.lng) * 1.25)
    );
}

export function calculateSameCountryDistance(countryCode, fromRegion, toRegion) {
    return calculateRegionDistance(countryCode, fromRegion, toRegion);
}
