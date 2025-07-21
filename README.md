# SecureAF - Unbreakable Data Vault

> Created with good ([vibes](https://lovable.dev)) but secured by [Tide](http://github.com/tide-foundation/tidecloak-js/blob/main/packages/tidecloak-react/README.md) 🛡️

A next-generation secure data vault built with advanced threshold cryptography. Store your most sensitive files and notes with mathematical proof that they cannot be stolen.

## 🔒 Key Features

- **Zero-Knowledge Architecture**: Your data is encrypted before it leaves your device
- **Keyless by Design**: Vault keys are mathematically impossible to reconstruct
- **Decentralized Protection**: Key fragments spread across independent nodes
- **Provable Security**: Cryptographic immunity to traditional hacking methods
- **Secure File Storage**: Upload and encrypt any file type
- **Encrypted Notes**: Create and manage secure text notes with tags
- **Secure Sharing**: Share encrypted files while maintaining control
- **Version History**: Track changes with tamper-proof audit trails

## 🏗️ Built With Advanced Technology

SecureAF is powered by [Tide Foundation's](https://tide.org) breakthrough threshold cryptography research. Unlike traditional security that relies on keeping keys secret, Tide decentralizes key fragments so no single point can ever reconstruct them.

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: TideCloak SDK for secure login
- **Encryption**: Advanced threshold cryptography
- **Database**: IndexedDB with Dexie for local storage
- **Build Tool**: Vite for fast development
- **UI Components**: Shadcn/ui for modern interface

## 📖 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd secureaf

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔐 How It Works

1. **Sign In**: Authenticate using TideCloak's secure protocol
2. **Create**: Add notes or upload files to your vault
3. **Encrypt**: Content is automatically encrypted with your distributed key
4. **Access**: Decrypt content only when needed with proper authorization
5. **Share**: Securely share encrypted files with granular access control

## 🛡️ Security Features

### Keyless Design
- Your vault key is never created in full, anywhere
- Mathematical impossibility of key reconstruction
- No single point of failure

### Decentralized Architecture
- Key fragments distributed across independent nodes
- No central authority can access your data
- Breakthrough immunity to data breaches

### Zero-Knowledge Protection
- Data encrypted client-side before transmission
- Server cannot decrypt your content
- Complete privacy by design

## 📱 Usage

### Managing Notes
- Create encrypted text notes with rich formatting
- Organize with tags and favorites
- Search through encrypted content
- Version history for all changes

### File Management
- Upload any file type up to [size limit]
- Automatic encryption on upload
- Secure download and sharing
- File metadata protection

### Backup & Export
- Create secure vault backups
- Encrypted export format
- Import from previous backups
- Cross-device synchronization

## 🔧 Development

### Project Structure

```
src/
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   └── vault/         # Vault-specific components
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
│   ├── encryption.ts  # Cryptography functions
│   └── database.ts    # Database operations
└── pages/             # Application pages
```

### Available Scripts

```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🚀 Deployment

### Using Lovable
1. Open your [Lovable Project](https://lovable.dev/projects/d79cbf3e-8e74-4b44-bb43-aae629e97c8b)
2. Click Share → Publish
3. Your app will be deployed automatically

### Custom Deployment
The built application can be deployed to any static hosting service:
- Vercel
- Netlify  
- GitHub Pages
- AWS S3 + CloudFront

## 🔗 Connect Custom Domain

To use your own domain:
1. Navigate to Project > Settings > Domains in Lovable
2. Click "Connect Domain"
3. Follow the DNS configuration steps

*Note: Custom domains require a paid Lovable plan*

## 🤝 Contributing

This project uses:
- **Code Style**: ESLint + Prettier
- **Commits**: Conventional commits preferred
- **Branches**: Feature branches with descriptive names

## 📜 License

Built with [Lovable](https://lovable.dev) - The AI-powered web development platform.

## 🔬 Research & Documentation

- [Tide Foundation Research](https://arxiv.org/pdf/2309.00915.pdf)
- [Threshold Cryptography Explained](https://tide.org)
- [TideCloak SDK Documentation](https://docs.tidecloak.com)

## ⚡ Performance

- Fast client-side encryption/decryption
- Efficient IndexedDB storage
- Optimized bundle size with tree-shaking
- Progressive loading for large files

---

**SecureAF** - Your Data, Impossible to Steal 🛡️
