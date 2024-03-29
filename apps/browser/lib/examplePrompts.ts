import { InMemoryFile } from "@nerfzael/memory-fs";

export interface ExamplePrompt {
  prompt: string;
  files?: InMemoryFile[];
}

const encoder = new TextEncoder();

const file1Csv = new InMemoryFile("file1.csv", encoder.encode(`Category	ID
Dining	6
Dining	9
Dining	14
Dining	15
Dining	24
Dining	26
Dining	33
Dining	40
Dining	45
Dining	55
Dining	57
Dining	64
Dining	67
Dining	72
Dining	78
Dining	81
Dining	84
Dining	94
Dining	96
Dining	103
Dining	107
Dining	109
Dining	117
Dining	124
Dining	126
Dining	131
Dining	137
Dining	142
Dining	149
Dining	150
Dining	155
Dining	158
Dining	165
Dining	170
Dining	171
Dining	180
Dining	181
Dining	185
Dining	190
Dining	196
Dining	197
Dining	201
Dining	210
Dining	211
Dining	215
Dining	219
Dining	225
Dining	226
Dining	231
Dining	232
Dining	239
Dining	246
Dining	250
Dining	256
Dining	257
Dining	262
Dining	263
Dining	270
Dining	277
Dining	281
Dining	287
Dining	288
Dining	293
Dining	294
Dining	301
Entertainment	4
Entertainment	7
Entertainment	23
Entertainment	34
Entertainment	54
Entertainment	63
Entertainment	73
Entertainment	83
Entertainment	91
Entertainment	104
Entertainment	112
Entertainment	121
Entertainment	134
Entertainment	141
Entertainment	152
Entertainment	161
Entertainment	167
Entertainment	175
Entertainment	183
Entertainment	193
Entertainment	200
Entertainment	205
Entertainment	213
Entertainment	222
Entertainment	233
Entertainment	238
Entertainment	243new InMemoryFile("file1.csv", file1Csv)
Entertainment	275
Entertainment	284
Entertainment	295
Entertainment	300
Groceries	1
Groceries	5
Groceries	11
Groceries	19
Groceries	28
Groceries	30
Groceries	37
Groceries	39
Groceries	42
Groceries	50
Groceries	59
Groceries	60
Groceries	62
Groceries	69
Groceries	79
Groceries	85
Groceries	90
Groceries	95
Groceries	100
Groceries	110
Groceries	116
Groceries	120
Groceries	125
Groceries	130
Groceries	139
Groceries	146
Groceries	151
Groceries	159
Groceries	168
Groceries	177
Groceries	182new InMemoryFile("file1.csv", file1Csv)
Shopping	71
Shopping	76
Shopping	86
Shopping	89
Shopping	97
Shopping	99
Shopping	101
Shopping	113
Shopping	118
Shopping	127
Shopping	129
Shopping	132
Shopping	144
Shopping	148
Shopping	156
Shopping	163
Shopping	173
Shopping	176
Shopping	187
Shopping	188
Shopping	194
Shopping	203
Shopping	206
Shopping	216
Shopping	223
Shopping	229
Shopping	235
Shopping	241
Shopping	247
Shopping	254
Shopping	260
Shopping	266
Shopping	272
Shopping	278
Shopping	285
Shopping	291
Shopping	297
Shopping	303
Transportation	3
Transportation	16
Transportation	20
Transportation	27
Transportation	32
Transportation	43
Transportation	47
Transportation	51
Transportation	58
Transportation	66
Transportation	75
Transportation	80
Transportation	88
Transportation	93
Transportation	102
Transportation	106
Transportation	114
Transportation	119
Transportation	123
Transportation	133
Transportation	136
Transportation	143
Transportation	147
Transportation	154
Transportation	162
Transportation	164
Transportation	172
Transportation	174
Transportation	184
Transportation	192
Transportation	195
Transportation	202
Transportation	204
Transportation	214
Transportation	221
Transportation	224
Transportation	234
Transportation	240
Transportation	245
Transportation	252
Transportation	255
Transportation	265
Transportation	271
Transportation	276
Transportation	283
Transportation	286
Transportation	296
Transportation	302
Utilities	10
Utilities	18
Utilities	22
Utilities	36
Utilities	41
Utilities	49
Utilities	53
Utilities	65
Utilities	74
Utilities	77
Utilities	87
Utilities	98
Utilities	105
Utilities	108
Utilities	115
Utilities	128
Utilities	135
Utilities	138
Utilities	145
Utilities	157
Utilities	166
Utilities	169
Utilities	178
Utilities	186
Utilities	191
Utilities	199
Utilities	208
Utilities	217
Utilities	220
Utilities	227
Utilities	237
Utilities	248
Utilities	251
Utilities	258
Utilities	268
Utilities	279
Utilities	282
Utilities	289
Utilities	299
`));

const file2Csv = new InMemoryFile("file2.csv", encoder.encode(`Date	Description	Amount	ID
2023-01-01	Grocery Store	52.3	1
2023-01-02	Pharmacy	12.5	2
2023-01-03	Gas Station	29.1	3
2023-01-04	Cinema Tickets	19	4
2023-01-05	Grocery Store	60.25	5
2023-01-06	Coffee Shop	4.5	6
2023-01-07	Cinema Tickets	20	7
2023-01-08	Book Store	30.4	8
2023-01-09	Restaurant Dinner	55.8	9
2023-01-10	Electric Bill	65.35	10
2023-01-11	Grocery Store	45.1	11
2023-01-12	Clothing Store	100.2	12
2023-01-13	Pharmacy	20.3	13
2023-01-14	Coffee Shop	4.5	14
2023-01-15	Restaurant Dinner	50	15
2023-01-16	Gas Station	32.1	16
2023-01-17	Online Shopping	80	17
2023-01-18	Water Bill	20.35	18
2023-01-19	Grocery Store	55.6	19
2023-01-20	Gas Station	28	20
2023-01-21	Pharmacy	15.4	21
2023-01-22	Phone Bill	40	22
2023-01-23	Cinema Tickets	20	23
2023-01-24	Coffee Shop	5.5	24
2023-01-25	Book Purchase	14	25
2023-01-26	Restaurant Lunch	30	26
2023-01-27	Public Transport	20	27
2023-01-28	Grocery Store	58.25	28
2023-01-29	Online Shopping	70	29
2023-01-30	Grocery Store	62.1	30
2023-01-31	Medical Prescription	10.4	31
2023-02-01	Gas Station	33	32
2023-02-02	Coffee Shop	6	33
2023-02-03	Cinema Tickets	22	34
2023-02-04	Book Store	28.4	35
2023-02-05	Internet Bill	50	36
2023-02-06	Grocery Store	60.1	37
2023-02-07	Clothing Store	120	38
2023-02-08	Grocery Store	58.25	39
2023-02-09	Coffee Shop	4.5	40
2023-02-10	Electric Bill	70	41
2023-02-11	Grocery Store	50.1	42
2023-02-12	Public Transport	18	43
2023-02-13	Pharmacy	24	44
2023-02-14	Restaurant Dinner	60	45
2023-02-15	Medical Prescription	11.4	46
2023-02-16	Gas Station	30	47
2023-02-17	Online Shopping	85	48
2023-02-18	Water Bill	18	49
2023-02-19	Grocery Store	53.6	50
2023-02-20	Public Transport	22	51
2023-02-21	Pharmacy	10	52
2023-02-22	Phone Bill	42	53
2023-02-23	Cinema Tickets	24	54
2023-02-24	Coffee Shop	6	55
2023-02-25	Book Purchase	16	56
2023-02-26	Restaurant Lunch	28	57
2023-02-27	Gas Station	34	58
2023-02-28	Grocery Store	56	59
2023-03-01	Online Shopping	90	60
2023-03-02	Dentist Appointment	130	61
2023-03-03	Grocery Store	63.45	62
2023-03-04	Cinema Tickets	21	63
2023-03-05	Coffee Shop	5.8	64
2023-03-06	Electric Bill	67.5	65
2023-03-07	Gas Station	31.2	66
2023-03-08	Restaurant Dinner	58	67
2023-03-09	Pharmacy	18.3	68
2023-03-10	Grocery Store	64.7	69
2023-03-11	Book Store	25.4	70
2023-03-12	Online Shopping	78	71
2023-03-13	Coffee Shop	6.5	72
2023-03-14	Museum Tickets	15	73
2023-03-15	Internet Bill	52	74
2023-03-16	Public Transport	19.5	75
2023-03-17	Clothing Store	105.6	76
2023-03-18	Phone Bill	41	77
2023-03-19	Coffee Shop	5	78
2023-03-20	Grocery Store	59.2	79
2023-03-21	Gas Station	29.8	80
2023-03-22	Restaurant Lunch	32	81
2023-03-23	Pharmacy	16.5	82
2023-03-24	Concert Tickets	50	83
2023-03-25	Coffee Shop	5.5	84
2023-03-26	Grocery Store	61.8	85
2023-03-27	Online Shopping	82	86
2023-03-28	Water Bill	19.35	87
2023-03-29	Public Transport	21	88
2023-03-30	Book Purchase	17	89
2023-03-31	Grocery Store	60	90
2023-04-01	Cinema Tickets	23	91
2023-04-02	Pharmacy	17.4	92
2023-04-03	Gas Station	33.5	93
2023-04-04	Restaurant Dinner	56.7	94
2023-04-05	Grocery Store	65.3	95
2023-04-06	Coffee Shop	5.9	96
2023-04-07	Online Shopping	87	97
2023-04-08	Electric Bill	69	98
2023-04-09	Clothing Store	112.5	99
2023-04-10	Grocery Store	57.4	100
2023-04-11	Book Store	26.3	101
2023-04-12	Gas Station	30.9	102
2023-04-13	Coffee Shop	6.8	103
2023-04-14	Zoo Tickets	24	104
2023-04-15	Internet Bill	53	105
2023-04-16	Public Transport	20.5	106
2023-04-17	Restaurant Lunch	34	107
2023-04-18	Phone Bill	43	108
2023-04-19	Coffee Shop	5.2	109
2023-04-20	Grocery Store	58.9	110
2023-04-21	Pharmacy	14.7	111
2023-04-22	Cinema Tickets	25	112
2023-04-23	Online Shopping	90	113
2023-04-24	Gas Station	31.4	114
2023-04-25	Water Bill	21	115
2023-04-26	Grocery Store	62.5	116
2023-04-27	Coffee Shop	5.7	117
2023-04-28	Book Purchase	18.5	118
2023-04-29	Public Transport	22	119
2023-04-30	Grocery Store	63	120
2023-05-01	Theater Tickets	45	121
2023-05-02	Dentist Appointment	135	122
2023-05-03	Gas Station	32.2	123
2023-05-04	Restaurant Dinner	59	124
2023-05-05	Grocery Store	66.1	125
2023-05-06	Coffee Shop	6	126
2023-05-07	Online Shopping	89	127
2023-05-08	Electric Bill	70.5	128
2023-05-09	Clothing Store	110	129
2023-05-10	Grocery Store	59.7	130
2023-05-11	Coffee Shop	6.1	131
2023-05-12	Book Store	29.2	132
2023-05-13	Gas Station	29.9	133
2023-05-14	Museum Tickets	16	134
2023-05-15	Internet Bill	52.5	135
2023-05-16	Public Transport	21.3	136
2023-05-17	Restaurant Lunch	35.4	137
2023-05-18	Phone Bill	43.5	138
2023-05-19	Grocery Store	64.8	139
2023-05-20	Pharmacy	15.2	140
2023-05-21	Cinema Tickets	26	141
2023-05-22	Coffee Shop	6.3	142
2023-05-23	Gas Station	30.8	143
2023-05-24	Online Shopping	92.5	144
2023-05-25	Water Bill	20.5	145
2023-05-26	Grocery Store	61.9	146
2023-05-27	Public Transport	23	147
2023-05-28	Book Purchase	19	148
2023-05-29	Coffee Shop	5.9	149
2023-05-30	Restaurant Dinner	57.8	150
2023-05-31	Grocery Store	66.7	151
2023-06-01	Theater Tickets	47	152
2023-06-02	Dentist Appointment	140	153
2023-06-03	Gas Station	31.6	154
2023-06-04	Coffee Shop	6.4	155
2023-06-05	Online Shopping	94	156
2023-06-06	Electric Bill	72	157
2023-06-07	Restaurant Lunch	36	158
2023-06-08	Grocery Store	65.3	159
2023-06-09	Pharmacy	17	160
2023-06-10	Cinema Tickets	27.5	161
2023-06-11	Public Transport	21.5	162
2023-06-12	Book Store	30	163
2023-06-13	Gas Station	28.7	164
2023-06-14	Coffee Shop	6.6	165
2023-06-15	Internet Bill	53.5	166
2023-06-16	Zoo Tickets	28	167
2023-06-17	Grocery Store	67.4	168
2023-06-18	Phone Bill	44	169
2023-06-19	Restaurant Dinner	60	170
2023-06-20	Coffee Shop	6.7	171
2023-06-21	Public Transport	22.5	172
2023-06-22	Online Shopping	96	173
2023-06-23	Gas Station	32.4	174
2023-06-24	Cinema Tickets	29	175
2023-06-25	Book Purchase	20	176
2023-06-26	Grocery Store	68.3	177
2023-06-27	Water Bill	22	178
2023-06-28	Pharmacy	18.5	179
2023-06-29	Restaurant Lunch	37	180
2023-06-30	Coffee Shop	7	181
2023-07-01	Grocery Store	69.5	182
2023-07-02	Theater Tickets	49	183
2023-07-03	Gas Station	33.2	184
2023-07-04	Park Picnic	40	185
2023-07-05	Electric Bill	73.5	186
2023-07-06	Clothing Store	120	187
2023-07-07	Online Shopping	98	188
2023-07-08	Grocery Store	70.6	189
2023-07-09	Coffee Shop	7.1	190
2023-07-10	Internet Bill	54	191
2023-07-11	Public Transport	23.5	192
2023-07-12	Museum Tickets	18	193
2023-07-13	Book Store	31	194
2023-07-14	Gas Station	29.9	195
2023-07-15	Coffee Shop	7.2	196
2023-07-16	Restaurant Dinner	62	197
2023-07-17	Grocery Store	71.8	198
2023-07-18	Phone Bill	45	199
2023-07-19	Zoo Tickets	30	200
2023-07-20	Coffee Shop	7.3	201
2023-07-21	Public Transport	24	202
2023-07-22	Online Shopping	99.5	203
2023-07-23	Gas Station	34	204
2023-07-24	Cinema Tickets	31	205
2023-07-25	Book Purchase	21.5	206
2023-07-26	Grocery Store	72.9	207
2023-07-27	Water Bill	23.5	208
2023-07-28	Pharmacy	19.5	209
2023-07-29	Restaurant Lunch	38.5	210
2023-07-30	Coffee Shop	7.4	211
2023-07-31	Grocery Store	73.7	212
2023-08-01	Theater Tickets	50	213
2023-08-02	Gas Station	34.5	214
2023-08-03	Restaurant Dinner	63.5	215
2023-08-04	Online Shopping	101	216
2023-08-05	Electric Bill	75	217
2023-08-06	Grocery Store	74.6	218
2023-08-07	Coffee Shop	7.5	219
2023-08-08	Phone Bill	46	220
2023-08-09	Public Transport	24.5	221
2023-08-10	Cinema Tickets	32.5	222
2023-08-11	Book Store	32	223
2023-08-12	Gas Station	35	224
2023-08-13	Coffee Shop	7.6	225
2023-08-14	Park Picnic	42	226
2023-08-15	Internet Bill	55	227
2023-08-16	Grocery Store	76.3	228
2023-08-17	Clothing Store	125	229
2023-08-18	Pharmacy	20.5	230
2023-08-19	Restaurant Lunch	40	231
2023-08-20	Coffee Shop	7.7	232
2023-08-21	Museum Tickets	19	233
2023-08-22	Public Transport	25	234
2023-08-23	Online Shopping	103	235
2023-08-24	Grocery Store	77.8	236
2023-08-25	Water Bill	24.5	237
2023-08-26	Zoo Tickets	32	238
2023-08-27	Coffee Shop	7.8	239
2023-08-28	Gas Station	35.5	240
2023-08-29	Book Purchase	23	241
2023-08-30	Grocery Store	78.9	242
2023-08-31	Cinema Tickets	34	243
2023-09-01	Theater Tickets	52	244
2023-09-02	Gas Station	36	245
2023-09-03	Restaurant Dinner	65	246
2023-09-04	Online Shopping	105	247
2023-09-05	Electric Bill	76.5	248
2023-09-06	Grocery Store	79.6	249
2023-09-07	Coffee Shop	8	250
2023-09-08	Phone Bill	47	251
2023-09-09	Public Transport	26	252
2023-09-10	Cinema Tickets	35.5	253
2023-09-11	Book Store	33	254
2023-09-12	Gas Station	36.5	255
2023-09-13	Coffee Shop	8.2	256
2023-09-14	Park Picnic	44	257
2023-09-15	Internet Bill	56	258
2023-09-16	Grocery Store	80.4	259
2023-09-17	Clothing Store	130	260
2023-09-18	Pharmacy	21.5	261
2023-09-19	Restaurant Lunch	41.5	262
2023-09-20	Coffee Shop	8.4	263
2023-09-21	Museum Tickets	20	264
2023-09-22	Public Transport	26.5	265
2023-09-23	Online Shopping	107	266
2023-09-24	Grocery Store	81.3	267
2023-09-25	Water Bill	25.5	268
2023-09-26	Zoo Tickets	33.5	269
2023-09-27	Coffee Shop	8.6	270
2023-09-28	Gas Station	37.5	271
2023-09-29	Book Purchase	24.5	272
2023-09-30	Grocery Store	82.7	273
2023-10-01	Cinema Tickets	36	274
2023-10-02	Theater Tickets	54	275
2023-10-03	Gas Station	38	276
2023-10-04	Restaurant Dinner	66.5	277
2023-10-05	Online Shopping	109	278
2023-10-06	Electric Bill	78	279
2023-10-07	Grocery Store	83.9	280
2023-10-08	Coffee Shop	8.8	281
2023-10-09	Phone Bill	48	282
2023-10-10	Public Transport	27.5	283
2023-10-11	Cinema Tickets	37.5	284
2023-10-12	Book Store	34.5	285
2023-10-13	Gas Station	39.5	286
2023-10-14	Coffee Shop	9	287
2023-10-15	Park Picnic	46	288
2023-10-16	Internet Bill	57.5	289
2023-10-17	Grocery Store	85.2	290
2023-10-18	Clothing Store	135	291
2023-10-19	Pharmacy	22.5	292
2023-10-20	Restaurant Lunch	43	293
2023-10-21	Coffee Shop	9.2	294
2023-10-22	Museum Tickets	21.5	295
2023-10-23	Public Transport	28	296
2023-10-24	Online Shopping	111	297
2023-10-25	Grocery Store	86.5	298
2023-10-26	Water Bill	26.5	299
2023-10-27	Zoo Tickets	35	300
2023-10-28	Coffee Shop	9.4	301
2023-10-29	Gas Station	40.5	302
2023-10-30	Book Purchase	26	303
2023-10-31	Grocery Store	88	304
`));

export const examplePrompts: ExamplePrompt[]  = [
  /*{
    prompt: "How much was spent on utilities within these CSVs? Write the result to a file.",
    files: [file1Csv, file2Csv]
  },*/
  { prompt: "Find the most recent Marburg Virus Disease outbreak and report the final case count, case fatality rate, country, and other relevant epidemiological information related to the outbreak" },
  { prompt: "Examine recent HPAI H5N1 avian influenza outbreaks, focusing on geographic spread, cross-species transmission to humans, and prevention strategies"},
  { prompt:"Detail recent chemical attacks in conflict zones, including agent types, delivery mechanisms, and civilian impact"}
];
