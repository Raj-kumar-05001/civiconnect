import React from "react";
import AppLayout from "../../components/AppLayout";
import ComplaintDetailView from "../../components/ComplaintDetailView";

export default function AdminComplaintDetails() {
  return (
    <AppLayout>
      <ComplaintDetailView isAdmin={true} backTo="/admin/complaints" />
    </AppLayout>
  );
}
