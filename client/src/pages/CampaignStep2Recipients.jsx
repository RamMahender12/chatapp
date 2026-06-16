import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiUpload,
  FiFile,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiClock,
  FiChevronDown,
  FiList,
  FiCrosshair,
  FiMail,
} from "react-icons/fi";
import CampaignStepper from "../components/CampaignStepper";

const MOCK_LISTS = [
  { id: "1", name: "All Subscribers", count: 2453 },
  { id: "2", name: "Newsletter Subscribers", count: 1892 },
  { id: "3", name: "Premium Members", count: 234 },
  { id: "4", name: "Trial Users", count: 327 },
  { id: "5", name: "Active Customers", count: 456 },
  { id: "6", name: "Inactive (90+ days)", count: 189 },
];

const MOCK_SEGMENTS = [
  { id: "1", name: "Active Users (Last 30 days)", count: 892, description: "Users who logged in within the last 30 days" },
  { id: "2", name: "Engaged Subscribers", count: 654, description: "Opened last 3 emails" },
  { id: "3", name: "Cart Abandoners", count: 123, description: "Added items but didn't purchase" },
  { id: "4", name: "VIP Customers", count: 89, description: "Spent over $1,000" },
  { id: "5", name: "Trial Ending Soon", count: 234, description: "Trial expires in next 7 days" },
];

const SAMPLE_CONTACTS = [
  { name: "John Smith", email: "john@example.com" },
  { name: "Sarah Johnson", email: "sarah@example.com" },
  { name: "Mike Chen", email: "mike@example.com" },
];

const QUICK_EMOJI_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmails = (text) => {
  const emails = text.split(/[\n,]/).map((e) => e.trim()).filter((e) => e);
  const valid = emails.filter((e) => QUICK_EMOJI_RE.test(e));
  const invalid = emails.filter((e) => !QUICK_EMOJI_RE.test(e));
  return { valid, invalid };
};

const RadioCard = ({ icon: Icon, title, description, selected, onClick, children }) => (
  <motion.div
    whileHover={{ scale: 1.005 }}
    onClick={onClick}
    className={`rounded-lg p-5 cursor-pointer transition-all ${
      selected
        ? "border-2 border-purple-600 bg-gray-50 shadow-md"
        : "border-2 border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm"
    }`}
    style={{ boxShadow: selected ? "0 2px 8px rgba(147,51,234,0.1)" : undefined }}
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? "border-purple-600" : "border-gray-300"
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{description}</p>
        {selected && children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  </motion.div>
);

const CampaignStep2Recipients = ({ onNext, onBack, initialData }) => {
  const [source, setSource] = useState(initialData?.source || null);
  const [selectedLists, setSelectedLists] = useState(initialData?.selectedLists || []);
  const [selectedSegment, setSelectedSegment] = useState(initialData?.selectedSegment || "");
  const [csvFile, setCsvFile] = useState(null);
  const [manualEmails, setManualEmails] = useState(initialData?.manualEmails || "");
  const [excludeLists, setExcludeLists] = useState([]);
  const [excludeEmails, setExcludeEmails] = useState("");
  const [excludeUnsubscribed] = useState(true);
  const [excludeBounced, setExcludeBounced] = useState(true);
  const [excludeSpam, setExcludeSpam] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const toggleList = (id) => {
    setSelectedLists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
  };

  const { valid: validEmails, invalid: invalidEmails } = useMemo(
    () => validateEmails(manualEmails),
    [manualEmails]
  );

  const csvValidation = useMemo(() => {
    if (!csvFile) return null;
    return { valid: 250, duplicates: 5, invalid: 3 };
  }, [csvFile]);

  const calcSourceCount = () => {
    if (source === "list") {
      return selectedLists.reduce((sum, id) => {
        const list = MOCK_LISTS.find((l) => l.id === id);
        return sum + (list?.count || 0);
      }, 0);
    }
    if (source === "segment") {
      const seg = MOCK_SEGMENTS.find((s) => s.id === selectedSegment);
      return seg?.count || 0;
    }
    if (source === "csv") return csvValidation?.valid || 0;
    if (source === "manual") return validEmails.length;
    return 0;
  };

  const calcExclusions = () => {
    let count = 0;
    if (excludeUnsubscribed) count += 432;
    if (excludeBounced) count += 89;
    if (excludeSpam) count += 12;
    return count;
  };

  const selectedCount = calcSourceCount();
  const exclusionCount = calcExclusions();
  const totalRecipients = Math.max(0, selectedCount - exclusionCount);
  const estimatedMinutes = Math.max(1, Math.ceil(totalRecipients / 1000));

  const isValid = () => {
    if (source === "list") return selectedLists.length > 0;
    if (source === "segment") return !!selectedSegment;
    if (source === "csv") return !!csvFile && (csvValidation?.valid || 0) > 0;
    if (source === "manual") return validEmails.length > 0;
    return false;
  };

  const handleNext = () => {
    if (!isValid()) return;
    const data = {
      source,
      selectedLists: source === "list" ? selectedLists : undefined,
      selectedSegment: source === "segment" ? selectedSegment : undefined,
      csvFile: source === "csv" ? csvFile : undefined,
      manualEmails: source === "manual" ? manualEmails : undefined,
      exclusions: {
        excludeLists,
        excludeEmails,
        excludeUnsubscribed,
        excludeBounced,
        excludeSpam,
      },
      recipientCount: totalRecipients,
    };
    onNext?.(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Stepper */}
      <CampaignStepper currentStep={2} />

      {/* Page Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Define recipients</h1>
        <p className="text-sm text-gray-600 mt-1">
          Choose who will receive this campaign
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-8 px-8 py-8 max-w-6xl mx-auto w-full">
        {/* Left Column */}
        <div className="flex-1 max-w-[700px] space-y-4">
          {/* Radio Cards */}
          <RadioCard
            icon={FiList}
            title="Email List"
            description="Select from email lists"
            selected={source === "list"}
            onClick={() => setSource("list")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select email lists
                </label>
                <div className="border border-gray-300 rounded-md p-3 space-y-2">
                  {MOCK_LISTS.map((list) => (
                    <label
                      key={list.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLists.includes(list.id)}
                        onChange={() => toggleList(list.id)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {list.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {list.count.toLocaleString()} contacts
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Manage lists →
                </button>
              </div>
              {selectedLists.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <p className="text-sm text-purple-900">
                    ✓ {selectedLists.length} list(s) selected
                  </p>
                </div>
              )}
            </div>
          </RadioCard>

          <RadioCard
            icon={FiCrosshair}
            title="Segment"
            description="Use rules to filter your audience"
            selected={source === "segment"}
            onClick={() => setSource("segment")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a segment
                </label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a segment...</option>
                  {MOCK_SEGMENTS.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name} ({seg.count.toLocaleString()} contacts)
                    </option>
                  ))}
                </select>
              </div>
              <button className="w-full px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-md font-medium hover:bg-purple-50 transition-colors text-sm">
                + Create new segment
              </button>
              {selectedSegment && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Estimated reach
                    </span>
                    <span className="text-lg font-semibold text-purple-600">
                      {MOCK_SEGMENTS.find((s) => s.id === selectedSegment)?.count.toLocaleString() || 0} contacts
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">Sample contacts:</p>
                    {SAMPLE_CONTACTS.map((contact, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                          {contact.name[0]}
                        </div>
                        <span className="text-gray-700">{contact.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{contact.email}</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 mt-2">
                      + {MOCK_SEGMENTS.find((s) => s.id === selectedSegment)?.count - 3 || 0} more
                    </p>
                  </div>
                </div>
              )}
            </div>
          </RadioCard>

          <RadioCard
            icon={FiUpload}
            title="CSV Upload"
            description="Import contacts from a file"
            selected={source === "csv"}
            onClick={() => setSource("csv")}
          >
            <div className="space-y-4">
              {!csvFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={() => setDragOver(false)}
                  className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer ${
                    dragOver ? "border-purple-400 bg-purple-50" : "border-gray-300"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FiUpload className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Drop CSV here or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        CSV must include &apos;email&apos; column. Max 10MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center">
                        <FiFile className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{csvFile.name}</p>
                        <p className="text-xs text-gray-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveFile} className="text-sm text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Map your columns</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email column <span className="text-red-500">*</span>
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                          <option value="">Select column...</option>
                          <option value="email">email</option>
                          <option value="Email">Email</option>
                          <option value="email_address">email_address</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          First name (optional)
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                          <option value="">Select column...</option>
                          <option value="firstName">firstName</option>
                          <option value="first_name">first_name</option>
                          <option value="name">name</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Last name (optional)
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                          <option value="">Select column...</option>
                          <option value="lastName">lastName</option>
                          <option value="last_name">last_name</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Validation Results</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-green-700">
                        <FiCheck className="w-4 h-4" />
                        <span>{csvValidation?.valid} valid emails</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-700">
                        <FiAlertTriangle className="w-4 h-4" />
                        <span>{csvValidation?.duplicates} duplicates (will be skipped)</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-700">
                        <FiX className="w-4 h-4" />
                        <span>{csvValidation?.invalid} invalid emails (will be skipped)</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-blue-200 mt-3">
                      <p className="text-sm font-semibold text-blue-900">
                        Net recipients: {csvValidation?.valid - csvValidation?.duplicates - csvValidation?.invalid || 0}
                      </p>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm">
                    Preview recipients
                  </button>
                </div>
              )}
            </div>
          </RadioCard>

          <RadioCard
            icon={FiMail}
            title="Manual Entry"
            description="Manually add specific recipients"
            selected={source === "manual"}
            onClick={() => setSource("manual")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter email addresses
                </label>
                <textarea
                  value={manualEmails}
                  onChange={(e) => setManualEmails(e.target.value)}
                  placeholder={"john@example.com, jane@example.com\nmike@example.com"}
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter one email per line or separate with commas
                </p>
              </div>
              {manualEmails && (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-700 font-medium">
                      ✓ {validEmails.length} valid
                    </span>
                    {invalidEmails.length > 0 && (
                      <span className="text-red-700 font-medium">
                        ✗ {invalidEmails.length} invalid
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setManualEmails("")}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Clear all
                  </button>
                </div>
              )}
              {invalidEmails.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-xs font-medium text-red-800 mb-2">Invalid emails:</p>
                  <div className="flex flex-wrap gap-1">
                    {invalidEmails.map((email, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm">
                Add from contacts
              </button>
            </div>
          </RadioCard>

          {/* Exclusions Section */}
          <details className="mt-6 border border-gray-200 rounded-lg bg-white">
            <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between list-none">
              <span className="text-sm font-medium text-gray-900">
                Advanced: Exclude recipients
              </span>
              <FiChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </summary>
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exclude from lists
                </label>
                <select
                  multiple
                  value={excludeLists}
                  onChange={(e) =>
                    setExcludeLists(
                      Array.from(e.target.selectedOptions, (o) => o.value)
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  size={4}
                >
                  <option value="1">Unsubscribed (432 contacts)</option>
                  <option value="2">Bounced Emails (89 contacts)</option>
                  <option value="3">Spam Complaints (12 contacts)</option>
                  <option value="4">Internal Team (25 contacts)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exclude specific emails
                </label>
                <textarea
                  value={excludeEmails}
                  onChange={(e) => setExcludeEmails(e.target.value)}
                  placeholder={"email1@example.com\nemail2@example.com"}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Automatic exclusions</p>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={excludeUnsubscribed}
                    disabled
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-600">Unsubscribed users (required)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={excludeBounced}
                    onChange={(e) => setExcludeBounced(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-600">Bounced emails</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={excludeSpam}
                    onChange={(e) => setExcludeSpam(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-600">Spam complaints</span>
                </label>
              </div>
            </div>
          </details>
        </div>

        {/* Right Column - Summary Card */}
        <div className="w-[320px] flex-shrink-0">
          <div className="sticky top-8 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">Total Recipients</p>
              <p className="text-4xl font-bold text-purple-600">
                {totalRecipients.toLocaleString()}
              </p>
            </div>
            <div className="border-t border-gray-200 my-6" />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Selected</span>
                <span className="font-semibold text-gray-900">
                  {selectedCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Exclusions</span>
                <span className="font-semibold text-red-600">
                  -{exclusionCount.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Net Recipients</span>
                  <span className="font-bold text-purple-600">
                    {totalRecipients.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiClock className="w-4 h-4" />
                <span>Est. send time: ~{estimatedMinutes} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-3 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid()}
            className={`px-5 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${
              isValid()
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Next: Set schedule
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom spacer for fixed bar */}
      <div className="h-16" />
    </div>
  );
};

export default CampaignStep2Recipients;
