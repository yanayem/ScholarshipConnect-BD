# Project Education & Component Documentation

This file serves as a central hub for understanding the components and logic used in the ScholarshipConnectBD project.

---

## 1. CustomInput Component
**Path:** `mobile/components/CustomInput.js`

### Overview
A reusable, styled text input component designed for a premium user experience. It handles focus states, error messages, and icon integration seamlessly.

### Component Logic (Bangla Explanation)
এই কম্পোনেন্টটি একটি **Reusable Component**। এর মাধ্যমে অ্যাপের যেকোনো জায়গায় ইনপুট বক্স তৈরি করা যায়।

*   **useState (isFocused):** ইউজার যখন ইনপুট বক্সে ক্লিক করে, তখন এটি `true` হয়ে যায় এবং বর্ডার কালার পরিবর্তন করে ইউজারকে ফিডব্যাক দেয়।
*   **Props:**
    *   `label`: ইনপুটের উপরে কি লেখা থাকবে (যেমন: "Email")।
    *   `icon`: বাম দিকে কি আইকন থাকবে (MaterialIcons ব্যবহার করে)।
    *   `error`: ভুল ইনপুটের জন্য লাল রঙের মেসেজ।
    *   `secureTextEntry`: পাসওয়ার্ড লুকানোর জন্য।
    *   **`...props` (Spread Operator):** এটি একটি অত্যন্ত শক্তিশালী জাভাস্ক্রিপ্ট ফিচার। 
    *   **এটি কি:** যখন আমরা `CustomInput` ব্যবহার করি, তখন আমরা হয়তো অনেক ধরণের প্রোপস পাঠাতে চাই (যেমন: `onChangeText`, `value`, `placeholder`, `keyboardType`, `maxLength` ইত্যাদি)। 
    *   **কিভাবে কাজ করে:** আমরা যদি এই সবগুলোকে আলাদা করে ডিক্লেয়ার না করি, তবে `...props` কিবোর্ড শর্টকাটের মতো কাজ করে। এটি বাকি সব প্রোপসকে একটি অবজেক্টে জমা করে এবং সরাসরি নিচের `TextInput`-এ পাঠিয়ে দেয়। এর ফলে আমাদের বারবার কোড লিখতে হয় না এবং `TextInput`-এর সব ডিফল্ট ফিচার অটোমেটিক কাজ করে।

#### Example of `...props`:
```javascript
// ব্যবহারের সময়:
<CustomInput 
  label="Phone Number" 
  icon="phone" 
  placeholder="017XXXXXXXX"  // এটি ...props এর মাধ্যমে TextInput-এ যাবে
  keyboardType="phone-pad"   // এটি ...props এর মাধ্যমে TextInput-এ যাবে
  maxLength={11}             // এটি ...props এর মাধ্যমে TextInput-এ যাবে
/>
```

*   **Styling:** এতে প্রিমিয়াম লুকের জন্য **Shadow (Elevation)** এবং ওয়েব ভার্সনের জন্য আউটলাইন রিমুভার ব্যবহার করা হয়েছে।

### Props Table
| Prop Name | Type | Description |
| :--- | :--- | :--- |
| `label` | String | The title shown above the input field. |
| `icon` | String | Material Icon name for the left side decoration. |
| `error` | String | Error message to display when validation fails. |
| `secureTextEntry` | Boolean | Whether to hide text (for passwords). |
| `rightIcon` | String | Icon name for interactive right-side button. |
| `onRightIconPress` | Function | Action triggered when right icon is clicked. |

### Component Structure & Terminology (Bangla Guide)

এই প্রোজেক্টে আমরা দুই ধরণের জিনিস ব্যবহার করছি:

#### ১. Built-in (আগে থেকে তৈরি):
এগুলো রিঅ্যাক্ট নেটিভ লাইব্রেরি আমাদের দিয়ে দেয়। আমাদের এগুলো নতুন করে বানাতে হয় না, শুধু ইমপোর্ট করে ব্যবহার করলেই হয়।
*   **`<View>`:** এটি একটি কন্টেইনার বা বক্স যা অন্য সব এলিমেন্টকে সাজিয়ে রাখতে ব্যবহার করা হয় (HTML-এর `<div>` এর মতো)।
*   **`<Text>`:** স্ক্রিনে যেকোনো টেক্সট বা লেখা দেখানোর জন্য এটি বাধ্যতামূলক।
*   **`StyleSheet`:** অ্যাপের ডিজাইন বা স্টাইল করার জন্য ব্যবহৃত হয় (CSS-এর মতো)।
*   **`<Pressable>`:** যেকোনো এলিমেন্টকে (যেমন: টেক্সট বা ইমেজ) বাটন বানানোর জন্য বা ক্লিকযোগ্য করার জন্য এটি ব্যবহার করা হয়।
*   **`<ActivityIndicator>`:** ডাটা লোড হওয়ার সময় যে গোল লোডিং স্পিনার (Loading Spinner) দেখা যায়, সেটিই এটি।
*   **`AsyncStorage`:** এটি মোবাইলের একটি ছোট মেমোরি বা লোকাল ডাটাবেস। অ্যাপ বন্ধ করলেও এখানে রাখা ডাটা মুছে যায় না। এটি সাধারণত ইউজারের সেটিংস বা লগইন স্ট্যাটাস সেভ করে রাখতে ব্যবহার করা হয়।
*   **কোথায় থাকে:** এগুলো `react-native` এবং `@react-native-async-storage/async-storage` প্যাকেজে থাকে।

#### ২. Custom (আমাদের নিজেদের তৈরি):
এগুলো প্রোজেক্টের প্রয়োজন অনুযায়ী আমরা নিজেরা কোড লিখে তৈরি করেছি।
*   **Custom Components:** যেমন- `CustomInput`, `Sidebar`, `Toast` ইত্যাদি। এগুলো `mobile/components/` ফোল্ডারে থাকে।
*   **Custom Styles (যেমন- `inputWrapper`):** এটি কোনো লাইব্রেরির অংশ নয়। এটি একটি নাম যা আমরা আমাদের ডিজাইনের জন্য দিয়েছি। 
    *   **কোথায় থাকে:** প্রতিটি ফাইলের নিচের দিকে `StyleSheet.create({ ... })` ব্লকের ভেতর এই কাস্টম স্টাইলগুলো ডিফাইন করা থাকে।
    *   **inputWrapper:** এটি মূলত একটি `View` যাকে আমরা ইনপুটের "ফ্রেম" হিসেবে ব্যবহার করছি। এটি আইকন এবং ইনপুট ফিল্ডকে একসাথে ধরে রাখে।

---

## 2. Sidebar Component
**Path:** `mobile/components/Sidebar.js`

### Overview
The main navigation menu for the desktop and tablet view of the application. It provides quick access to all major sections of the app and displays user profile information.

### Component Logic (Bangla Explanation)
এই কম্পোনেন্টটি অ্যাপের মেইন নেভিগেশন মেনু বা **Sidebar** হিসেবে কাজ করে।

*   **useRouter & usePathname:** এক পেজ থেকে অন্য পেজে যাওয়া এবং ইউজার বর্তমানে কোন পেজে আছে তা চেনার জন্য ব্যবহৃত হয়।
*   **NAV_ITEMS:** মেনুর সব অপশনগুলোকে একটি লিস্ট আকারে রাখা হয়েছে যাতে সহজে মেইনটেইন করা যায়।
*   **Authentication & Roles:** এটি ডাটাবেস এবং মোবাইল মেমোরি (AsyncStorage) থেকে চেক করে দেখে ইউজার কি একজন সাধারণ ছাত্র নাকি অ্যাডমিন। যদি ইউজার অ্যাডমিন না হয়, তবে সে 'Admin Panel' অপশনটি দেখতে পায় না।
*   **Active Link Highlighting:** ইউজার যে পেজে থাকে, সেই মেনুটিকে `isActive` লজিক দিয়ে হাইলাইট করা হয়।
*   **Initials Calculation:** ইউজারের প্রোফাইল পিকচার না থাকলে তার নামের প্রথম দুই অক্ষর (যেমন: Tanvir Ahamed -> TA) দিয়ে একটি সুন্দর গোল Avatar তৈরি করে। যদি নাম না থাকে তবে ইউজারনেম ব্যবহার করে।
*   **Conditional Rendering:** ইউজার অ্যাডমিন না হলে `return null` লজিক ব্যবহার করে 'Admin Panel' মেনুটি লুকিয়ে রাখা হয়।
*   **Layout Structure:** পুরো সাইডবারকে `logoContainer`, `navContainer`, এবং `footerContainer` এই তিনটি ভাগে ভাগ করা হয়েছে।
*   **Text Truncation:** `numberOfLines={1}` ব্যবহার করা হয়েছে যাতে বড় নাম ডিজাইনের ক্ষতি না করে এক লাইনেই সীমাবদ্ধ থাকে।

### CSS & Layout Concepts
| Style Prop | Why used? |
| :--- | :--- |
| `flexDirection: 'column'` | To stack Logo, Navigation, and Profile vertically. |
| `borderRightWidth` | To separate the sidebar from the main screen content. |
| `flex: 1` | Used in `navContainer` so it takes up all available middle space. |
| `gap` | Used to create consistent spacing between menu items. |

---

## 3. Toast Component
**Path:** `mobile/components/Toast.js`

### Overview
একটি আধুনিক Tailwind-style এনিমেটেড নোটিফিকেশন সিস্টেম। এটি ব্যবহারকারীকে বিভিন্ন কাজের ফিডব্যাক (Success, Error, Info) দিতে ব্যবহৃত হয়।

### Component Logic (Bangla Explanation)
*   **Custom Hook (useToast):** এই হুকটি ব্যবহার করে অ্যাপের যেকোনো জায়গা থেকে টোস্ট মেসেজ দেখানো যায়। এটি `showToast` ফাংশন এবং `ToastComponent` রিটার্ন করে।
*   **Animated API:** এখানে React Native-এর `Animated` লাইব্রেরি ব্যবহার করা হয়েছে। `opacity`, `translateY` (উপর থেকে নিচে নামা), এবং `scale` (ছোট থেকে বড় হওয়া) এর সমন্বয়ে একটি প্রিমিয়াম এনিমেশন তৈরি করা হয়েছে।
*   **Auto-dismiss:** `setTimeout` ব্যবহার করে ৩.৫ সেকেন্ড পর টোস্টটি অটোমেটিক স্ক্রিন থেকে চলে যাওয়ার লজিক সেট করা আছে।
*   **Spring Animation:** `Animated.spring` ব্যবহার করা হয়েছে যাতে এনিমেশনটি দেখতে একদম ন্যাচারাল এবং বাউন্সি মনে হয়।

### Technical Terms & Hooks
*   **useRef (Timer Management):** নতুন টোস্ট আসার আগে আগের টোস্টের টাইমার বন্ধ (Clear) করার জন্য টাইমার রেফারেন্স ধরে রাখতে ব্যবহৃত হয়।
*   **useCallback:** ফাংশনটিকে মেমোরিতে সেভ রাখে যাতে বারবার রেন্ডার হয়ে অ্যাপ স্লো না হয়।
*   **Platform (Device Specific):** iOS এবং Android-এর নচ বা স্ট্যাটাস বার অনুযায়ী টোস্টের পজিশন (`top: 60` বা `top: 44`) ডাইনামিকলি সেট করার জন্য।
*   **Animated API:** অপাসিটি এবং মুভমেন্ট হ্যান্ডেল করে স্মুথ ইউজার এক্সপেরিয়েন্স নিশ্চিত করে।

### Usage Example
```javascript
const { showToast, ToastComponent } = useToast();

// কল করার নিয়ম:
showToast('Scholarship saved successfully!', 'success');

// JSX এর ভেতর রাখতে হবে:
{ToastComponent}
```

### Type Configurations
| Type | Icon | Color | Purpose |
| :--- | :--- | :--- | :--- |
| **Success** | `check-circle` | Green | সফল কাজের ফিডব্যাক। |
| **Error** | `cancel` | Red | কোনো ভুল বা ব্যর্থতার মেসেজ। |
| **Warning** | `warning` | Amber | সতর্কবার্তা দেওয়ার জন্য। |
| **Info** | `info` | Blue | সাধারণ তথ্য জানানোর জন্য। |

---

## 4. ScholarshipCard Component
**Path:** `mobile/components/cards/ScholarshipCard.js`

### Overview
এটি একটি কাস্টম কার্ড কম্পোনেন্ট যা স্কলারশিপের সংক্ষিপ্ত তথ্য সুন্দরভাবে উপস্থাপন করে। এটি সাধারণত হোম স্ক্রিনে হরাইজন্টাল লিস্টে ব্যবহার করা হয়।

### Component Logic (Bangla Explanation)
*   **Props-driven Content:** এটি ডাইনামিকলি টাইটেল, অর্গানাইজেশন, ডেডলাইন এবং অ্যামাউন্ট গ্রহণ করে।
*   **Style Switching:** `getCardStyle` ফাংশন ব্যবহার করে কার্ডের টাইপ অনুযায়ী (Featured, Deadline, Standard) ব্যাকগ্রাউন্ড কালার পরিবর্তন করা হয়।
*   **Text Constraints:** টাইটেল খুব বড় হলে যেন ডিজাইন না ভাঙে, সেজন্য `numberOfLines={2}` ব্যবহার করা হয়েছে।
*   **Layout:** পুরো কার্ডটি তিনটি সেকশনে বিভক্ত—Header (Icon & Amount), Content (Title & Org), এবং Footer (Deadline & Apply Button)।

### Card Types & Styles
| Type | Color Scheme | Purpose |
| :--- | :--- | :--- |
| `featured` | `primaryAccent` | হাই-ভ্যালু বা বিশেষ স্কলারশিপের জন্য। |
| `deadline` | `lavenderCard` | আবেদনের সময় শেষ হয়ে আসছে এমন স্কলারশিপের জন্য। |
| `standard` | `surface` (White) | সাধারণ সব স্কলারশিপের জন্য। |

---

## 5. Authentication Flow (Firebase)
**Status:** Migrated from SimpleJWT to Firebase.
- **Frontend:** Uses Firebase SDK for Login/Register.
- **Backend:** Verifies the Firebase ID Token.

---

## 3. Admin Access
- Admin emails are managed via the `.env` file on the backend (`ADMIN_EMAILS`).
- Mobile Admin Portal has an additional security layer using Django Admin credentials.
