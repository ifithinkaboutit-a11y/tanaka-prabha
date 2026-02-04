# Internationalization (i18n) Implementation

This document describes the i18n implementation for the Tanak Prabha app.

## 📁 File Structure

```
src/i18n/
├── index.ts      # i18n initialization and exports
├── en.json       # English translations
└── hi.json       # Hindi translations
```

## 🚀 Setup

The i18n system is initialized in `src/app/_layout.tsx`:

```typescript
import "../i18n"; // Initialize i18n
```

## 📝 Usage

Import the translation function and use it in components:

```typescript
import T from "../i18n";

// Use in JSX
<AppText>{T.translate("programs.title")}</AppText>

// Use in props (cast to string)
<Button label={String(T.translate("programs.viewAll"))} />
```

## 🔧 Key Features

- **Fallback Support**: If a translation key doesn't exist in the current language, it falls back to English
- **Type Safety**: All translate calls are cast to strings for component props
- **Flat Key Structure**: Uses dot notation for organized, predictable keys
- **No Runtime Reload**: Language switching works without app restart

## 🌐 Supported Languages

- **English (en)**: Default language
- **Hindi (hi)**: User-selectable (future implementation)

## 📋 Translation Keys

### Programs Module
- `programs.title` - Page title
- `programs.searchPlaceholder` - Search bar placeholder
- `programs.governmentSchemes` - Government schemes section title
- `programs.trainingPrograms` - Training programs section title
- `programs.viewAll` - View all button text

### Program Reader
- `programReader.keyObjectives` - Key objectives heading
- `programReader.tabs.overview` - Overview tab
- `programReader.tabs.process` - Process tab
- `programReader.tabs.support` - Support tab
- `programReader.applyNow` - Apply now button

### Detail Forms
- `personalDetails.title` - Personal details page title
- `landDetails.title` - Land details page title
- `livestockDetails.title` - Livestock details page title

## 🔄 Language Switching (Future)

To implement language switching in the future:

```typescript
import T from "../i18n";

// Switch to Hindi
T.setTexts({ en: enTranslations, hi: hiTranslations });
```

## ✅ Best Practices

- ✅ Every visible UI string uses `T.translate()`
- ✅ Keys are semantic and English-based
- ✅ No concatenated strings
- ✅ No hardcoded text in components
- ✅ Flat key structure with dot notation