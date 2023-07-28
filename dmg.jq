map(select(.Ready) | select(.Type | contains("DMG"))) | map({
  serial: .Serial,
  backlight,
  bivert,
  prosound,
  amp,
  glass,
  ips,
  vanilla: (.ips or .prosound or .bitvert or .backlight) | not,
  notes,
  work: .Work,
  state: .State
})
