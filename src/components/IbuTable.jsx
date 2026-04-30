import { barisReadonly, barisRumus } from '../config/tableConfig';

export default function IbuTable({ singkatanBulan, tableData, handleChange }) {
    return (
        <table className="w-full border-collapse border border-black text-sm">
            <thead>
                <tr>
                    <th className="border border-black p-2 w-12 text-center bg-gray-50" rowSpan={2}>NO.</th>
                    <th className="border border-black p-2 text-center bg-gray-50" rowSpan={2}>URAIAN KEGIATAN</th>
                    <th className="border border-black p-1 text-center w-32 bg-gray-50">BULAN</th>
                </tr>
                <tr>
                    <th className="border border-black p-1 text-center uppercase bg-gray-50">{singkatanBulan}</th>
                </tr>
            </thead>
            <tbody>
                {tableData.map((row, index) => {
                    let rowBg = row.customColor;
                    let labelStyle = '';
                    let showInput = true;

                    // Aturan Utama (Timpa warna jika itu Header/Subheader/Kosong)
                    if (row.isBlank) {
                        showInput = false;
                        rowBg = 'bg-white';
                    } else if (row.isHeader) {
                        showInput = false;
                        rowBg = 'bg-gray-400';
                        labelStyle = 'font-bold text-[15px] text-gray-800';
                    } else if (row.isSubheader) {
                        rowBg = 'bg-gray-300';
                        labelStyle = 'font-bold text-gray-800';
                    }

                    const isRumus = barisRumus.includes(row.label.trim());

                    if (barisReadonly.includes(row.label.trim()) || isRumus) {
                        showInput = false;
                    }

                    if (isRumus) {
                        rowBg = 'bg-gray-200';
                    }

                    return (
                        <tr key={index} className="hover:bg-gray-100/50">
                            <td className={`border border-black px-2 py-1.5 text-center font-bold ${rowBg}`}>
                                {row.no}
                            </td>
                            <td className={`border border-black px-3 py-1.5 ${rowBg} ${labelStyle}`}>
                                {row.label}
                            </td>
                            <td className={`border border-black p-0 relative ${rowBg}`}>
                                {showInput ? (
                                    <input
                                        type="number"
                                        value={row.value ?? ""}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        className="w-full h-full min-h-[34px] px-2 outline-none text-center focus:bg-yellow-200 transition-colors bg-transparent"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[34px] bg-transparent flex items-center justify-center font-bold text-gray-700">
                                        {isRumus ? row.value : ""}
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
