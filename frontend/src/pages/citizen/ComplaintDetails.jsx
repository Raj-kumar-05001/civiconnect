import React from "react";
import AppLayout from "../../components/AppLayout";
import ComplaintDetailView from "../../components/ComplaintDetailView";

export default function CitizenComplaintDetails() {
  return (
    <AppLayout>
      <ComplaintDetailView isAdmin={false} backTo="/citizen/complaints" />
    </AppLayout>
  );
}
