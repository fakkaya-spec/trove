# TROVE Primitive Components

All exported from `src/app/App.tsx`.

## KeelLine
A 2px vertical blue left border. Used on cards/items that are complete or verified.
```tsx
// Inside a position:relative container:
<KeelLine />
```
Rule: Add KeelLine when item state is `done=true`, `keel=true`, or observation type.

## BackButton
44×44 tap zone, 32×32 visual circle.
```tsx
<BackButton onClick={() => onScreen("trip_plan")} />
<BackButton onClick={goBack} dark />  // dark prop for vessel/underway dark headers
```

## Card
White surface with sh1 shadow.
```tsx
<Card p="12px 16px" mb={12} keel={isDone}>
  {children}
</Card>
```
Props: `p` (padding), `mb` (margin-bottom), `keel` (adds KeelLine), `style`.

## Pill (StatusPill)
Colored badge for state communication.
```tsx
<Pill text="Planning" type="info" />
<Pill text="2 obs" type="warn" />
<Pill text="Day 3 of 7" type="ghost" />  // dark backgrounds only
```
Types: `ok` | `warn` | `err` | `info` | `ghost` | `neutral`

## Bar
Progress bar.
```tsx
<Bar pct={75} h={3} color={T.green} />
```
Default color: T.blue. Switch to T.green at 100%.

## SLabel
Section header with optional action button.
```tsx
<SLabel mt={20} action="View all" onAction={() => onScreen("log")}>Open observations</SLabel>
```

## Divider
1px horizontal rule.
```tsx
<Divider my={16} />
```

## RowItem
Label + value row for detail tables.
```tsx
<RowItem label="Engine" value="Volvo Penta 75 hp" />
<RowItem label="HIN" value="BAVVN51K2001" mono />
<RowItem label="Details" onPress={() => {}} last />
```
Set `mono=true` for measured values only (see IBM Plex Mono rule).

## Photo (EvidencePhoto)
Uploadable photo with overlay label and timestamp.
```tsx
<Photo src={PH.hull} label="Hull" time="Jun 15" slot="v-hull" />
<Photo src={PH.deck} label="Deck" w={120} h={90} r={12} />
```
When `slot` provided: tap opens file picker, uploads persist in photoStore.

## StatusBar
```tsx
<StatusBar />        // light screens
<StatusBar dark />   // vessel, underway dark headers
```

## BottomNav
3 tabs: Trip · Log · Vessel
```tsx
<BottomNav screen={screen} onScreen={onScreen} />
```
Auto-highlights active tab based on SCREEN_TO_TAB map.

## Navigation model
```
Trip tab → welcome → trip_plan → trip_crew
                               → trip_provisions → trip_shopping
                               → trip_predep
                               → trip_checkin
                               → trip_underway → trip_checkout → trip_report
Log tab  → log → log_add
Vessel tab → vessel
```
