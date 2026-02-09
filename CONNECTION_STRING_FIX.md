# How to Add Database Name to MongoDB Connection String

## What Atlas Shows You:

```
mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/?appName=Cluster0
```

## What You Need (Add Database Name):

You need to **manually add** `/legal_guardian` before the `?`:

### Option 1: With Database Name (Recommended)

```
mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
```

### Option 2: Keep appName Parameter

```
mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?appName=Cluster0
```

## Step-by-Step Change:

**Original from Atlas:**
```
mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/?appName=Cluster0
                                                                                  ^
                                                                                  Here (before the ?)
```

**Add `/legal_guardian` before the `?`:**

```
mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?appName=Cluster0
                                                                                  ^^^^^^^^^^^^^^
                                                                                  ADD THIS
```

## For Your Backend .env File:

Use this format:

```env
MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian
```

## Visual Guide:

```
Original:    ...mongodb.net/?appName=Cluster0
                             ^ (no database name)

Fixed:       ...mongodb.net/legal_guardian?appName=Cluster0
                             ^^^^^^^^^^^^^^ (database name added)
```

That's it! Just add `/legal_guardian` right before the `?` in your connection string.

