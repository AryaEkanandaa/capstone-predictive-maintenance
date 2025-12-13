import MLResultCard from "./MLResultCard";
import TicketConfirmationCard from "./TicketConfirmationCard";
import MachineStatusCard from "./MachineStatusCard";
import renderMessage from "../../utils/renderMessage";

export default function MessageAI({ text }) {
    let parsed = null;

    try {
        parsed = JSON.parse(text);
    } catch { }


    if (parsed?.type === "machine_status") {
        return (
            <div className="flex justify-start">
                <MachineStatusCard data={parsed} />
            </div>
        );
    }

    if (parsed?.type === "all_machine_status") {
        return (
            <div className="flex flex-col gap-4">
                {parsed.machines.map((m) => (
                    <MachineStatusCard key={m.machine_id} data={m} />
                ))}
            </div>
        );
    }

    if (parsed?.type === "manual_prediction") {
        return (
            <div className="flex justify-start">
                <MLResultCard data={parsed} />
            </div>
        );
    }

    if (parsed && parsed.type === "ticket_confirmation") {
        return (
            <div className="flex justify-start">
                <TicketConfirmationCard data={parsed} />
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div className="bg-white border px-4 py-3 rounded-2xl max-w-[70%] shadow">
                {renderMessage(text)}
            </div>
        </div>
    );
}
