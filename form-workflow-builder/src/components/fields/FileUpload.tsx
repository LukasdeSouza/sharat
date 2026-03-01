import React from 'react';

interface FileUploadProps {
    label: string;
    error?: string;
    required?: boolean;
    accept?: string;
    onChange: (value: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    error,
    required = false,
    accept,
    onChange,
}) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="file"
                accept={accept}
                onChange={(e) => {
                    // In a real app, you'd handle the file upload to a server
                    // and store the resulting URL or ID.
                    // For now, we'll just pass the file info.
                    const file = e.target.files?.[0];
                    if (file) {
                        onChange(file.name);
                    }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
            />
            {accept && (
                <p className="mt-1 text-xs text-gray-500">
                    Accepted types: <code className="bg-gray-100 px-1 rounded">{accept}</code>
                </p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
