import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
	terms: [{ type: String }],
}, { timestamps: true });

if (mongoose.models.SearchHistory) delete mongoose.models.SearchHistory;
if (mongoose.connection?.models?.SearchHistory) delete mongoose.connection.models.SearchHistory;
if (mongoose.modelSchemas?.SearchHistory) delete mongoose.modelSchemas.SearchHistory;
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
