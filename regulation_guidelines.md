Guidelines: 
1.	The SOX auditor wants to know when the User login and what he does while he is in the system, if he changes anything related to financial information, we must record this activity.
2.	The SOX auditor selects randomly any UI of the platform, example: DEMANDE interface and asks IT analyst to provide a screenshot the name of the table that keeps all information are input from this UI in order to do the matching of information.

SOX audit requires to keep a record of financial information, in our platform we need to add a new table to keep/track User login Activities: Userlogin_Hist (User login History File)
•	_id
•	companyId
•	branchId
•	UserId
•	role
•	First name
•	Last name
•	User Login Date and Time
•	User Logout Date and Time
•	User modifies DEMANDE: 
	Demande Number
	ReqAmt_Before, ReqAmt_After
	Status_Before, Status_After
	ApprovalAmt_Before, ApprovalAmt_After
	ModifiedBy
•	User modifies Prêt:   (in the next Sprint)
	Prêt number
	PrêtAmt_Before, PrêtAmt_After
	ModifiedBy
•	User modifies instalment Amount:   (in the next Sprint)
	InstalmentAmt_Before, InstalmentAmt_After


@doan @Huy Well, you translate these requirements into coding and designing DB based on these guidelines above. Any questions so I am here to support.