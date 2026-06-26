import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Download, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const BankRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 last:border-0">
    <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
    <span className={`text-primary text-sm text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
  </div>
);

const Donate = () => {
  const { settings } = useSettings();
  const upiId = settings.upi_id;
  const payeeName = settings.upi_payee_name;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div data-testid="donate-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary no-print" data-testid="donate-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Support Our Cause
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Make a Donation
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Your contribution helps us support victims of medical negligence, 
              provide legal resources, and advocate for healthcare accountability in India.
            </p>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-16 bg-slate-50" data-testid="donation-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* QR Code Card */}
            <Card className="border-slate-200" data-testid="qr-code-card">
              <CardHeader className="text-center border-b border-slate-100 pb-4">
                <CardTitle className="font-serif text-xl">Scan to Donate</CardTitle>
                <p className="text-sm text-slate-500 mt-2">
                  Scan the QR code using any UPI app to make a donation
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="qr-container flex flex-col items-center">
                  <QRCodeSVG
                    value={upiUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    data-testid="donation-qr-code"
                  />
                  <p className="mt-4 font-mono text-sm text-slate-600">
                    {upiId}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {payeeName}
                  </p>
                </div>

                <div className="flex gap-3 mt-6 no-print">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-300"
                    onClick={handleCopyUPI}
                    data-testid="copy-upi-btn"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy UPI
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-300"
                    onClick={handlePrint}
                    data-testid="print-qr-btn"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <div className="space-y-6 no-print">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary">
                        Why Donate?
                      </h3>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Your donation directly supports victims of medical negligence by funding 
                    legal awareness programs, maintaining this platform, and helping families 
                    access justice resources.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-bold text-primary mb-4">
                    How Your Donation Helps
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                      <span>Provide free legal information and guidance to victims</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                      <span>Maintain and improve this awareness platform</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                      <span>Support community outreach and education programs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
                      <span>Advocate for better healthcare accountability laws</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-primary text-white">
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-bold mb-2">
                    Other Ways to Help
                  </h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Can't donate? You can still make a difference!
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Share this platform with others</li>
                    <li>• Spread awareness on social media</li>
                    <li>• Volunteer your skills and time</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Transfer Details */}
      <section className="py-16 bg-white no-print" data-testid="bank-details-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Alternative
            </p>
            <h2 className="font-serif text-2xl font-bold text-primary">
              Bank Transfer Details
            </h2>
          </div>

          <div className="space-y-6 max-w-xl mx-auto">
            {/* Domestic */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  Domestic Transfer (NEFT / RTGS / IMPS / UPI)
                </p>
                <div className="space-y-3">
                  {(settings.bank_account_name || payeeName) && (
                    <BankRow label="Account Name" value={settings.bank_account_name || payeeName} />
                  )}
                  {settings.bank_account_number && (
                    <BankRow label="Account Number" value={settings.bank_account_number} mono />
                  )}
                  {settings.bank_name && (
                    <BankRow label="Bank" value={settings.bank_name} />
                  )}
                  {settings.bank_ifsc && (
                    <BankRow label="IFSC Code" value={settings.bank_ifsc} mono />
                  )}
                  {settings.bank_branch && (
                    <BankRow label="Branch" value={settings.bank_branch} />
                  )}
                  {upiId && (
                    <BankRow label="UPI ID" value={upiId} mono />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-5 text-center">
                  For donations above ₹50,000, please contact us for proper documentation.
                </p>
              </CardContent>
            </Card>

            {/* International — only shown if SWIFT is set */}
            {settings.bank_swift && (
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                    International Wire Transfer (SWIFT)
                  </p>
                  <div className="space-y-3">
                    {(settings.bank_account_name || payeeName) && (
                      <BankRow label="Beneficiary Name" value={settings.bank_account_name || payeeName} />
                    )}
                    {settings.bank_account_number && (
                      <BankRow label="Account Number" value={settings.bank_account_number} mono />
                    )}
                    {settings.bank_name && (
                      <BankRow label="Bank Name" value={settings.bank_name} />
                    )}
                    <BankRow label="SWIFT / BIC" value={settings.bank_swift} mono />
                    {settings.bank_ifsc && (
                      <BankRow label="IFSC Code" value={settings.bank_ifsc} mono />
                    )}
                    {settings.bank_beneficiary_address && (
                      <BankRow label="Beneficiary Address" value={settings.bank_beneficiary_address} />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-5 text-center">
                    Please email us after initiating a wire transfer so we can confirm receipt.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            {settings.contact_email && (
              <div className="text-center text-sm text-slate-500">
                Questions?{' '}
                <a href={`mailto:${settings.contact_email}`}
                  className="text-secondary hover:text-amber-700 font-medium">
                  {settings.contact_email}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-16 bg-slate-50 no-print" data-testid="share-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Share2 className="h-12 w-12 text-secondary mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-bold text-primary mb-4">
            Spread the Word
          </h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Even if you can't donate, sharing our mission with your network 
            can make a huge difference in raising awareness.
          </p>
          <Button
            variant="outline"
            className="border-primary text-primary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Support Medical Negligence Victims',
                  text: 'Help support victims of medical negligence in India through VOICE-Victims\' Outreach & Initiative for Crime of Medical Negligence',
                  url: window.location.origin
                });
              } else {
                navigator.clipboard.writeText(window.location.origin);
                toast.success('Link copied to clipboard!');
              }
            }}
            data-testid="share-btn"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share This Page
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Donate;
