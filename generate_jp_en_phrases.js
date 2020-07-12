// https://www.reddit.com/r/LearnJapanese/comments/g34sa3/i_found_a_text_dump_for_animal_crossing_on_switch/

const xml2js = require('xml2js')
const fs = require('fs')
const walk = require('walk')
const path = require('path')
const csv = require('@fast-csv/format');

const REMOVE_MARKUP = true

const CONVERSION_RULES = [
  [/\x0En\x01\x00/gs, '{name}'],
  [/\x0En\x00\x00/gs, '...'],
  [/\x0En[^\x01\x02]\x00/gs, '{name}'],
  [/\x0En\x03\x00/gs, '{markup_n}'],
  [/\x0En\x07\x02\x01Í/gs, '{fruit}'],
  [/\x0En\x07\x02\x00Í/gs, '{fruit}'],
  [/\x0En\x1F\x02\x00Í/gs, '{name}'],
  [/\x0En\x1F\x02\x01Í/gs, '{name}'],
  [/\x0En\x15\x02\x00Í/gs, '{timeday}'],
  [/\x0En\x15\x02\x01Í/gs, '{timeday}'],
  [/\x0En\x15\x02\x02Í/gs, '{timeday}'],
  [/\x0En\x16\x02\x01Í/gs, '{timeday}'],
  [/\x0En\x15\x02\x03Í/gs, '{timeday}'],
  [/\x0En\x0B\x02\x00Í/gs, '{name}'],
  [/\x0En\x02\x00/gs, '{name}'],
  [/\x0En\x0B\x02\x01Í/gs, '{name}'],
  [/\x0En\f\x02\x00Í/gs, '{name}'],
  [/\x0En\&\x02[\x00\x01]Í/gs, '{markup_n}'],

  [/\x0Es\x00\x02[\x00\x01\x02]Í/gs, '{something}'],
  [/\x0Es\x01\x02\x00Í/gs, '{name}'],
  [/\x0Es\x02\x02\x00Í/gs, '{name}'],
  [/\x0Es\x03\x02[\x00\x01]Í/gs, '{something}'],
  [/\x0Es\x05\x02\x00Í/gs, '{something}'],
  [/\x0Es\x07\x02\x00Í/gs, '{something}'],
  [/\x0Es\x06\x02\x00Í/gs, '{name}'],
  [/\x0Es\x08\x02\x00Í/gs, '{name}'],

  [/\x0E\x00\x03\x02[\x00\x01\x02]\x00/gs, '{color}'],
  [/\x0E\x00\x03\x02\x03\x00/gs, '{color}'],  
  [/\x0E\x00\x03\x02\x04\x00/gs, '{/color}'],
  [/\x0E\x00\x03\x02ÿÿ/gs, '{/color}'],
  [/\x0E\x00\x04\x00/gs, '{newpage}'],  
  [/\x0E\x00\x00\x04\x00\x00\x00/gs, '{markup00}'],
  [/\x0E\x00\x00\x04\x00\x00\x00\x0E\x00\(\x00\$\x00\x04\x00촀\x00/gs, '{markup00}'],
  [/\x0E\x00\x00\x04\x00\x00\x00W\x00e\x00l\x00l\x00/gs, '{well}'],
  [/\x0E\x00\x00\x04\x00\x00\x00T\x00h\x00a\x00t\x00/gs, '{Thats}'],
  [/\x0E\x00\x03\x02[\x06\x07]\x00/gs, '{markup00}'],
  [/\x0E\x00\([\x00\x02\x06\x15\x18\"\$]+\x04촀\x00/gs, '{markup00}'],
  [/\x0E\x00\(\x00\$\x00\x04\x00촀\x00/gs, '{markup00}'],
  [/\x0E\x00\(\x00\%\x00\x04\x00촀\x00/gs, '{markup00}'],
  [/\x0E\(&\x04\x01Í\x00\x00/gs, '{button}'],

  [/\x0EZ\x1C\x00/gs, '{date}'],
  [/\x0EZ#\x02\x00Í/gs, '{date}'],
  [/\x0EZ\$\x02\x00Í/gs, '{date}'],
  [/\x0EZ\x1B\x00/gs, '{year}'],
  [/\x0EZ\x16\x02\x00\x00/gs, '{price}'],
  [/\x0EZ\x14\x02.\x00/gs, '{price}'],
  [/\x0EZ\x18\x02\x00\x00/gs, '{price}'],
  [/\x0EZ\f\x02\x00\x00/gs, '{price}'],
  [/\x0EZ\r\x02\x01\x00/gs, '{price}'],
  [/\x0EZ\x15\x02\x00\x00/gs, '{price}'],
  [/\x0EZ\x01\x02\x00\x00/gs, '{number}'],
  [/\x0EZ\x15\x02\x01\x00/gs, '{price}'],
  [/\x0EZ\"\x02\x00Í/gs, '{year}'],
  [/\x0EZ\(\x02\x00Í/gs, '{tickets}'],
  [/\x0EZ\%\x02\x00Í/gs, '{timeday}'],
  [/\x0EZ\%\x02\x01Í/gs, '{timeday}'],
  [/\x0EZ\%\x02\x02Í/gs, '{timeday}'],
  [/\x0EZ\%\x02\x03Í/gs, '{timeday}'],
  [/\x0EZ\x01\x02\n\x00/gs, '{number}'],
  [/\x0EZ\x19\x02\x00\x00/gs, '{price}'],
  [/\x0EZ\x1E\x00/gs, '{hour}'],
  [/\x0EZ\x1F\x00/gs, '{minute}'],
  [/\x0EZ\x1D\x00/gs, '{date}'],
  [/\x0EZ\x04\x02\x01\x00/gs, '{number}'],
  [/\x0EZ\x08\x02\x01\x00/gs, '{number}'],
  [/\x0EZ\x00\x02\x0E\x00/gs, '{minutes}'],
  [/\x0EZ\x00\x02.[\x00\x01]/gs, '{number}'],
  [/\x0EZ\x01\x02.[\x00\x01]/gs, '{number}'],
  [/\x0EZ\x02\x02.[\x00\x01]/gs, '{number}'],
  [/\x0EZ\x03\x02.[\x00\x01]/gs, '{number}'],
  [/\x0EZ\x08\x02.[\x00\x01]/gs, '{number}'],
  [/\x0EZ\x15\x02.\x00/gs, '{price}'],
  [/\x0EZ\x17\x02.[\x00\x01]/gs, '{price}'],
  [/\x0EZ\x1A\x02.\x00/gs, '{price}'],
  [/\x0EZ\*\x00/gs, '{month}'],
  [/\x0EZ\+\x00/gs, '{day}'],
  [/\x0EZ\!\x00/gs, '{time}'],

  [/\x0E}\x00\x02\x00\x00\x0F/gs, '{something}'],
  [/\x0E}\x00\x02[\x00\x01\x02\x03\x04\x05]\x00/gs, '{something}'],
  [/\x0E}\x00\x02\x00\x02/gs, '{something}'],
  [/\x0E}[\x02\x03]\x02[\x00\x01]Í/gs, '{number}'],
  [/\x0E}\x04\x02\x00[\x00\x02]/gs, '{something}'],
  [/\x0E}\x05\x02[\x00\x01]Í/gs, '{something}'],
  [/\x0E}\x06\x02[\x00\x01\x02\x03\x04]Í/gs, '{something}'],
  [/\x0E}\x07\x02\x00Í/gs, '{name}'],

  [/\x0E\x8C\x12\x02[\x00\x01][\x00\x01\x02]/gs, '{something}'],
  [/\x0E\x8C\x00\x02\x00Í/gs, '{something}'],
  [/\x0E\x8C\x04\x02\x00Í/gs, '{rank}'], // house rank
  [/\x0E\x8C.\x02\x00Í/gs, '{word}'],
  
  [/\x0E2\x0B\x00/gs, '{minuteCounter}'],
  [/\x0E2\x0d\x00/gs, '{counter?}'],

  // unknown patterns

  [/\x0E\x00\x02\x02K\x00/gs, '{small}'],
  [/\x0E\x00\x02\x02\x96\x00/gs, '{small}'],
  [/\x0E\x00\x02\x02d\x00/gs, '{/small}'],
  [/\x0E\x00\x02\x02.[\x00\x01]/gs, '{markup00}'],
  [/\x0E\x00\x00\b\x04\x00d0K0/gs, '{object}'],
  [/\x0E\x00\x00\x00\x04\x00\x00/gs, '{markup00}'],
  [/\x0E\x00\x03\x02[\x02\x04\x05]\x00/gs, '{markup00}'],
  [/\x0E\x00\n\x00\x02\x00\x00\x00\n\x00H\x00o\x00w\x00 \x00a\x00r\x00e\x00 \x00y\x00o\x00u\x00/gsi, '{how_are_you}'],

  [/\x0Ed\x03\x02[\x00\x01\x02]Í/gs, '{markup99}'],
  [/\x0Ed.\x00/gs, '{markup99}'],

  [/\x0E2\x06\x10\x06\x00g\x00u\x00y\x00\x06\x00g\x00a\x00l\x00/gsi, '{guy_gal}'],
  [/\x0E2\x06\x0E\x04\x00H\x00e\x00\x06\x00S\x00h\x00e\x00/gsi, '{he_she}'],
  [/\x0E2\x07\x0E\x04\x00h\x00e\x00\x06\x00S\x00h\x00e\x00/gsi, '{he_she}'],
  [/\x0E2\x07\x10\x06\x00h\x00i\x00m\x00\x06\x00h\x00e\x00r\x00/gsi, '{him_her}'],
  [/\x0E2\x07\x10\x06\x00h\x00i\x00s\x00\x06\x00h\x00e\x00r\x00/gsi, '{his_her}'],
  [/\x0E2\x07\x10\x06\x00'\x00i\x00m\x00\x06\x00'\x00e\x00r\x00/gsi, '{im_er}'],
  [/\x0E2\x07 \x0E\x00h\x00i\x00m\x00s\x00e\x00l\x00f\x00\x0E\x00h\x00e\x00r\x00s\x00e\x00l\x00f\x00/gs, '{himself_herself}'],
  [/\x0E2\x07\x1A\x06\x00s\x00o\x00n\x00\x10\x00d\x00a\x00u\x00g\x00h\x00t\x00e\x00r\x00/gsi, '{son_daughter}'],
  [/\x0E2\x07\x1A\n\x00H\x00e\x00\'\x00l\x00l\x00\f\x00S\x00h\x00e\x00\'\x00l\x00l\x00/gsi, '{he_ll_she_ll}'],
  [/\x0E2\x07\x16\x08\x00h\x00e\x00\'\x00s\x00\n\x00s\x00h\x00e\x00\'\x00s\x00/gsi, '{he_s_she_s}'],
  [/\x0E2\x07\x16\x08\x00h\x00e\x00\'\x00d\x00\n\x00s\x00h\x00e\x00\'\x00d\x00/gsi, '{he_d_she_d}'],
  [/\x0E2\x07\x12\x06\x00h\x00i\x00s\x00\x08\x00h\x00e\x00r\x00s\x00/gsi, '{his_hers}'],
  [/\x0E2[\x05\x07]\x10\x04\x00«0ì0\x08\x00«0Î0¸0ç0/gsi, '{name}'],
  [/\x0E2\x11\x16\x0F\x01\x00Í\x06\x00h\x00i\x00m\x00\x06\x00h\x00e\x00r\x00\x00\x00/gsi, '{he_her}'],
  [/\x0E2\x11\x16\x0F\x01\x00Í\x06\x00h\x00i\x00s\x00\x06\x00h\x00e\x00r\x00\x00\x00/gsi, '{his_her}'],
  [/\x0E2\x11\x14\x0F\x01\x00Í\x04\x00h\x00e\x00\x06\x00s\x00h\x00e\x00\x00\x00/gsi, '{he_she}'],
  [/\x0E2\x11\x1E\x0F\x00\x00Í\x06\x00h\x00i\x00m\x00\x06\x00h\x00e\x00r\x00\x08\x00t\x00h\x00e\x00m\x00/gsi, '{him_her_them}'],
  [/\x0E2\x11\x14\x0F\x00\x00Í\x04\x00h\x00e\x00\x06\x00s\x00h\x00e\x00\x00\x00/gsi, '{he_she}'],
  [/\x0E2\x11\x16\x0E\x00\x00Í\x04\x00«0ì0\x08\x00«0Î0¸0ç0\x00\x00/gsi, '{name}'],
  [/\x0E2\x11\x16\x0F\x00\x00Í\x06\x00h\x00i\x00m\x00\x06\x00h\x00e\x00r\x00\x00\x00/gsi, '{him_her}'],
  [/\x0E2\x11\x16\x0F\x00\x00Í\x06\x00h\x00i\x00s\x00\x06\x00h\x00e\x00r\x00\x00\x00/gsi, '{his_her}'],
  [/\x0E2\x11\x1C\x0F\x00\x00Í\x08\x00h\x00e\x00'\x00d\x00\n\x00s\x00h\x00e\x00'\x00d\x00\x00\x00/gsi, '{he_d_she_d}'],
  [/\x0E2\x11\x1C\x0F\x00\x00Í\x04\x00h\x00e\x00\x06\x00s\x00h\x00e\x00\x08\x00t\x00h\x00e\x00y\x00/gsi, '{he_she_they}'],
  [/\x0E2\x11\x1C\x0F\x00\x00Í\x08\x00h\x00e\x00'\x00s\x00\n\x00s\x00h\x00e\x00'\x00s\x00\x00\x00/gsi, '{he_s_she_s}'],
  [/\x0E2\x11 \x0F\x00\x00Í\n\x00H\x00e\x00'\x00l\x00l\x00\f\x00S\x00h\x00e\x00'\x00l\x00l\x00\x00\x00/gsi, '{he_ll_she_ll}'],
  [/\x0E2\x08\*\x00\x01\f\x00p\x00o\x00i\x00n\x00t\x00s\x00\n\x00p\x00o\x00i\x00n\x00t\x00\f\x00p\x00o\x00i\x00n\x00t\x00s\x00/gsi, '{points}'],
  [/\x0E2\x08<\x00\x00\x12\x00d\x00o\x00n\x00a\x00t\x00i\x00o\x00n\x00s\x00\x10\x00d\x00o\x00n\x00a\x00t\x00i\x00o\x00n\x00\x12\x00d\x00o\x00n\x00a\x00t\x00i\x00o\x00n\x00s\x00/gsi, '{donations}'],
  [/\x0E2\x080\x00\x00\n\x00w\x00e\x00e\x00k\x00s\x00\x14\x00w\x00h\x00o\x00l\x00e\x00 \x00w\x00e\x00e\x00k\x00\n\x00w\x00e\x00e\x00k\x00s\x00/gsi, '{weeks}'],
  [/\x0E2\x08\$\x00\x00\n\x00i\x00t\x00e\x00m\x00s\x00\x08\x00i\x00t\x00e\x00m\x00\n\x00i\x00t\x00e\x00m\x00s\x00/gsi, '{items}'],
  [/\x0E2\x08\$\x00\x00\n\x00p\x00a\x00r\x00t\x00s\x00\x08\x00p\x00a\x00r\x00t\x00\n/gsi, '{parts_part}'],
  [/\x0E2\x08\*\x00\x07\f\x00p\x00o\x00i\x00n\x00t\x00s\x00\n\x00p\x00o\x00i\x00n\x00t\x00\f\x00p\x00o\x00i\x00n\x00t\x00s\x00/gsi, '{points}'],
  [/\x0E2\x08\$\x00\x00\n\x00w\x00e\x00e\x00k\x00s\x00\x08\x00w\x00e\x00e\x00k\x00\n\x00w\x00e\x00e\x00k\x00s\x00/gsi, '{week_weeks}'],
  [/\x0E2\x08\*\x00\x01\f\x00m\x00o\x00n\x00t\x00h\x00s\x00\n\x00m\x00o\x00n\x00t\x00h\x00\f\x00m\x00o\x00n\x00t\x00h\x00s\x00/gsi, '{month_months}'],
  [/\x0E2\x080\x00\x02\n\]\x00y\x00e\x00a\x00r\x00s\x00\x14\x00w\x00h\x00o\x00l\x00e\x00 \x00y\x00e\x00a\x00r\x00\n\x00y\x00e\x00a\x00r\x00s\x00/gsi, '{year_years}'],
  [/\x0E2\x080\x00\x02\n\x00y\x00e\x00a\x00r\x00s\x00\x14\x00w\x00h\x00o\x00l\x00e\x00 \x00y\x00e\x00a\x00r\x00\n\x00y\x00e\x00a\x00r\x00s\x00/gsi, '{year_years}'],
  [/\x0E2\x08\$\x00\x02\n\x00y\x00e\x00a\x00r\x00s\x00\x08\x00y\x00e\x00a\x00r\x00\n\x00y\x00e\x00a\x00r\x00s\x00/gsi, '{year_years}'],
  [/\x0E2\x086\x00\x01\f\x00m\x00o\x00n\x00t\x00h\x00s\x00\x16\x00w\x00h\x00o\x00l\x00e\x00 \x00m\x00o\x00n\x00t\x00h\x00\f\x00m\x00o\x00n\x00t\x00h\x00s\x00/gsi, '{month_months}'],
  [/\x0E2\x086\x00\x00\x10\x00p\x00u\x00s\x00h\x00-\x00u\x00p\x00s\x00\x0E\x00p\x00u\x00s\x00h\x00\-\x00u\x00p\x00\x10\x00p\x00u\x00s\x00h\x00\-\x00u\x00p\x00s\x00/gsi, '{pushup_pushups}'],

  [/\x0E2\x03\x00/gs, '{markup3}'],
  [/\x0E2\x00\x04\x00.\x00Í/gs, '{markup50}'],
  [/\x0E2\x00\x04\x00.\x03Í/gs, '{markup50}'],
  [/\x0E2\x00\x04\x05\x04\x03Í/gs, '{markup50}'],
  [/\x0E2\x15\x02\x00Í/gs, '{markup50}'],
  [/\x0E2\x01\x00/gs, '{markup50'],
  [/\x0E2\x02\x00/gs, '{markup50}'],
  [/\x0E2\x04\x00/gs, '{markup50}'],
  //[/\x0E2\x07/gs, '{markup50_7}'],
  [/\x0Es\x01\x02\x01Í/gs, '{someone1}'],
  [/\x0Es\x00\x02\x00Í/gs, '{someone0}'],

  [/\x0EZ\x03\x02\x00\x00/gs, '{markup_z}'],

  //[/\x0E}\x00\x02.\x00/gs, '{something}'],

  // expressions?
  [/\x0E\(.\x04...\x00/gs, '{markup28}'], 
  [/\x0E\(\"\x08\x04Í\x04\x00N\x001\x00/gs, '{markup28}'],
  [/\x0E\(\"\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}'],
  [/\x0E\(\x00\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}' ],
  [/\x0E\(\x02\x08\x04Í\x04\x00N\x001\x00/gs, '{markup28}'],
  [/\x0E\(\x02\x06\x00Í\x02\x000\x00/gs, '{markup28}'],
  [/\x0E\(\x02\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}'],
  [/\x0E\(\x02\x08\x00Í\x04\x00µ0Ö0/gs, '{markup28}'],
  [/\x0E\(\x02\x00\x04\x00\x00Í\x00\x00/gs, '{markup28}'],
  [/\x0E\(\x01\x08\x04Í\x04\x00N\x001\x00/gs, '{markup28}'],
  [/\x0E\(\x07\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}'],
  [/\x0E\(\%\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}'],
  [/\x0E\(\x1A\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}'],
  [/\x0E\(\x0B\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}'],
  [/\x0E\(\x15\x08\x04Í\x04\x00N\x002\x00/gs, '{markup28}'],
  [/\x0E\(\x02\x08\x00Í\x04\x00µ0Ö0/gs, '{markup28}'],

  [/\x0E\n\x00\x02\x1E\x00/gs, '{newline}'],
  [/\x0E\n\x00\x02 \x00/gs, '{markup10_0}'],
  [/\x0E\n[\x01\x03\x04\x05]\x00\x00\x00/gs, '{markup10_1_1}'],
  [/\x0E\n[\x01\x03\x04\x05]\x00/gs, '{markup10_1}'],
  [/\x0E\n\x00\x02[\x01-z]\x00/gs, '{markup10_2}'],
  [/\x0E\n\x00\x02\</gs, '{markup10_2_1}'],
  [/\x0E\n\x00\x00\x02\x00\(\x00\n\x00/gsi, '{markup10_2_2}'],
  [/\x0E\n\x02.?[\x00]+\n\x00/gs, '{markup10_3_l}'],
  [/\x0E\n\x02.?[\x00]+/gs, '{markup10_3}'],
  [/\x0E\n\f\x00/gs, '{markup10_4}'],
  [/\x0E\n\n\x00/gs, '{markup10_5}'],
  [/\x0E\n\x09\x00/gs, '{markup10_6}'],
  [/\x0E\n\x08\x04[\<]\x00\x00\x00/gs, '{markup10_7}'],
  [/\x0E\n\x08\x04\x1E\x00\x00\x00/gs, '{markup10_8}'],
  [/\x0E\n\x08\x04.\x00\x00\x00/gs, '{markup10}'],
  [/\x0E\n\x07\x04.\x00\x00\x00/gs, '{markup10}'],
  [/\x0E\n\x07\x04.\x01\x00\x00/gs, '{markup10}'],
  [/\x0E\n\x08\x04\x00\x00\x00\x00/gs, '{markup10}'],
  [/\x0E\n\r\x00/gs, '{markup10}'],
  [/\x0E\n\x06\x00/gs, '{markup10}'],
  [/\x0E\n\x0E\x02[\x08\x10\x14\(2P]\x00/gs, '{markup10}'],
  [/\x0E\n\x0F\x02[\x00\x01][\x00\x01]/gs, '{markup10}'],
  [/\x0E\n\x0B\x00/gs, '{markup10}'],
  [/\x0E\n\x00\x02\(/gs, '{markup10}'],
  [/\x0E\n\x00\x00\x00\x02\x00\x1E\x00\n\x00I\x00t\x00/gs, '{markup10}'],

  [/\x0E\-[\x01\x02\x03\x04\x05\x06]\x04\x00Í\x00\x00/gs, '{markup45}'],
  [/\x0E-\x00\x04\x00Í\x00\x00/gs, '{markup45}'],

  [/\x0E\x8C\x09\x02\x00Í\x0F\n\x05/gs, '{markup}'],

  [/\x0E\x87\x05\x02\x00Í/gs, '{markupx87}'],
  [/\x0E\x87\x07\x02[\x00\x05\x06\x07\x08]Í/gs, '{something}'],
  [/\x0E\x87\x07\x02\x02Í/gs, '{something}'],
  [/\x0E\x87\x03\x02[\x01\x02\x03\x04\x05\x06]Í/gs, '{something}'],
  [/\x0E\x87.\x02[\x00\x01\x02\x03\x04]Í/gs, '{something}'],
  [/\x0E\x87.\x02[\x00\x01\x02\x03\x04]\x00/gs, '{something}'],

  [/\x0E\x14\x02\x02.Í/gs, '{markup14}'],
  [/\x0E\x14\x03\x02.Í/gs, '{markup14}'],

  [/\x0Ed\x09\x02.Í/gs, '{markup_d}'],

  [/\x0E\x14\x00\x18\x16\x00N\x002\x00>\x00N\x000\x00,\x00N\x003\x00>\x00N\x000\x00/gs, '{markup_14}'],
  [/\x0E\x14\x00\x18\x16\x00P\x000\x00>\x00N\x001\x00,\x00N\x000\x00>\x00N\x001\x00/gs, '{markup_14}'],
  [/\x0E\x14\x01\x1A\x18\x00N\x000\x00>\x00N\x001\x00,\x00 \x00N\x001\x00>\x00N\x000\x00/gs, '{markup_14}'],
  [/\x0E\x82\x00\x02[\x00\x01]Í/sg, '{something}'],


  [/\x0Fd\x06/gs, '{markup_0x0F}'],
  [/\x0Fd\x05/gs, '{markup_0x0F}'],
  [/\x0Fd\x02/gs, '{markup_0x0F}'],
  [/\x0F\n[\x05\x06\x0d]/gs, '{markup0x0F}'],
  [/\x0Fn\x0E/gs, '{markup_0x0f}'],
  [/\x0Fd[\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09]/gs, '{markup_0x0f_d}'],
]


const unescapeHtmlEntities = (text) => {
  return text.replace(/&#x0;/g, '\x00')
}

const removeFuriganaMarkup = (text) => {
  //const furiganaMarkerPattern = /\x0E&#x0;&#x0;(..)&#x0;(.)&#x0;/gs
  const furiganaMarkerPattern = /\x0E\x00\x00(..)\x00(.)\x00/gs
  let filtered = ''
  let sourceIndex = 0
  while ((match = furiganaMarkerPattern.exec(text)) !== null) {
    filtered = filtered + text.slice(sourceIndex, match.index)
    furiganaLength = match[2].charCodeAt(0)
    sourceIndex = furiganaMarkerPattern.lastIndex + furiganaLength
  }
  filtered = filtered + text.slice(sourceIndex)
  return filtered
}

const parseEntry = (entry, domain) => {
  let name = entry.$.NAME
  let original = entry.original[0]

  let filtered = unescapeHtmlEntities(original)
  filtered = removeFuriganaMarkup(filtered)
  let textWithMarkup = '' + filtered
  for (let conversion of CONVERSION_RULES) {
    textWithMarkup = textWithMarkup.replace(conversion[0], conversion[1])

    if (REMOVE_MARKUP && conversion[1].startsWith('{markup')) {
      filtered = filtered.replace(conversion[0], '')
    } else {
      filtered = filtered.replace(conversion[0], conversion[1])
    }
  }

  if (filtered.match(/\x0E/)) {
    return null
  }

  if (domain == 'TalkSNpc.sza.SP_sza_50_IslandEvaluation' && name == '003_04') {
  // if (name == 'Fish_00329') {
    console.log(name)
    console.log([unescapeHtmlEntities(original)])
    console.log([filtered])
  }
//  if (filtered.match(/\x0E/) ||
//       filtered.match(/\x0F/)) {
//     console.log(name)
//     console.log([filtered])
//   }

  return {
    name: name,
    text: filtered,
    markup: textWithMarkup
  }
}


const parser = new xml2js.Parser({
  strict: false,
  normalizeTags: true,
});

const parseFile = async (filename, domain) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, function(err, data) {
      parser.parseString(data, function (err, result) {
        if (err) {
          console.error(err)
          reject(err)
          return
        }
        let entries = []
        for (let entry of result.kup.entries[0].entry) {
          const parsedEntry = parseEntry(entry, domain)
          if (parsedEntry) {
            entries[parsedEntry.name] = { 
              text: parsedEntry.text,
              markup: parsedEntry.markup
            }
          }
        }
        resolve(entries)
      })
    })
  })
}

const enStringsDir = 'raw/acnh1.1msgen'
const jaStringsDir = 'raw/acnh1.1msgjp'
const enCode = 'USen'
const jaCode = 'JPja'
const pairs = []

const enToJaPath = (enPath) => {
  return enPath.replace(enStringsDir, jaStringsDir).replace(enCode, jaCode)
}

const jaToEnPath = (enPath) => {
  return enPath.replace(jaStringsDir, enStringsDir).replace(jaCode, enCode)
}

const crawlPaths = (callback) => {
  const sourceDir = enStringsDir
  const sourceCode = enCode
  const pathConvert = enToJaPath

  // const sourceDir = jaStringsDir
  // const sourceCode = jaCode
  // const pathConvert = jaToEnPath

  const walker =  walk.walk(sourceDir)
  walker.on('file', (root, stats, next) => {
    if (stats.name.endsWith('.kup')) {
      let sourcePath = path.join(root, stats.name)
      let destPath = pathConvert(sourcePath)
      fs.stat(destPath, (err, stats) => {
        if (stats && stats.isFile()) {
          const domain = sourcePath
            .replace(`${sourceDir}${path.sep}`, '')
            .replace(`_${sourceCode}`, '')
            .replace('.msbt.kup', '')
            .replace(/\//g, '.')
          pairs.push({en: sourcePath, ja: destPath, domain: domain})
        } else {
          console.log(`Unable to find ${destPath}`)
        }
        next()
      })
    } else {
      next()
    }
  })
  walker.on('end', () => {
    console.log(pairs.length)
    callback(pairs)
  })
}

crawlPaths((files) => {
  let tasks = []

  for (let filePair of files) {
    let parseTask = Promise.all([parseFile(filePair.en, filePair.domain), parseFile(filePair.ja, filePair.domain)])
      .then((enJaEntries) => {
        let msgPairs = []
        enEntries = enJaEntries[0]
        jaEntries = enJaEntries[1]

        // Match entries
        for (let enEntryKey of Object.keys(enEntries)) {
          if (jaEntries[enEntryKey]) {
            const msgId = `${filePair.domain}.${enEntryKey}`
            msgPairs.push({
              msgId: msgId,
              en: enEntries[enEntryKey].text,
              ja: jaEntries[enEntryKey].text,
              enMarkup: enEntries[enEntryKey].markup,
              jaMarkup: jaEntries[enEntryKey].markup
            })
          }
        }
        return msgPairs
      })
    tasks.push(parseTask)
  }

  Promise.all(tasks)
    .then(messagesList => {
      const stream = csv.format({ headers: true })
      const ws = fs.createWriteStream('data/messages.csv')
      stream.pipe(ws)

      let seenEn = new Set()
      let seenJa = new Set()
      let duplicateCount = 0
      let messageCount = 0
      let allMessages = []
      for (let messages of messagesList) {
        for (let message of messages) {
          if (seenEn.has(message.en)) {
            duplicateCount++
            continue
          }
          if (seenJa.has(message.ja)) {
            duplicateCount++
            continue
          }
          seenEn.add(message.en)
          seenJa.add(message.ja)
          allMessages.push(message)
          stream.write(message)
          messageCount++
        }
      }
      fs.writeFileSync('data/messages.json', JSON.stringify(allMessages))
      console.log(`Total messages ${messageCount} (duplicates: ${duplicateCount})`)
    })
})