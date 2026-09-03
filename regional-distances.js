/* regional-distances.js
   Region/state/province delivery engine.
   Regions are represented by approximate central coordinates.
   Add more country entries to REGIONS whenever you want finer
   intra-country pricing. Countries without a region dataset fall
   back to country-level distance.
*/
import { haversineKm } from "./country-distances.js";

export const REGIONS = {
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
