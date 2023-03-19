const getPartnerInfo = (participants, userEmail) => {
  return participants.find((participant) => participant.email !== userEmail);
};
export default getPartnerInfo;
