package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"sort"
	"time"

	ics "github.com/arran4/golang-ical"
)

type Session struct {
	SessionType string    `json:"sessionType"`
	Start       time.Time `json:"start"`
	End         time.Time `json:"end"`
}

type Round struct {
	Name     string    `json:"name"`
	Country  string    `json:"country"`
	Start    time.Time `json:"start"`
	End      time.Time `json:"end"`
	Sessions []Session `json:"sessions"`
	Over     bool      `json:"over"`
}

var summaryRegex = regexp.MustCompile(`FORMULA 1 (.+) - (.+)`)

func parseSummary(summary string) (roundName, sessionType string, ok bool) {
	matches := summaryRegex.FindStringSubmatch(summary)
	if len(matches) != 3 {
		return "", "", false
	}
	return matches[1], matches[2], true
}

func groupEventsToRounds(events []*ics.VEvent) ([]Round, error) {
	roundsMap := make(map[string]*Round)
	now := time.Now().UTC()

	for _, event := range events {

		summaryProp := event.GetProperty("SUMMARY")
		locationProp := event.GetProperty("LOCATION")

		if summaryProp == nil || locationProp == nil {
			continue
		}

		summary, location := summaryProp.Value, locationProp.Value

		roundName, sessionType, ok := parseSummary(summary)
		if !ok {
			// invalid event formats
			continue
		}

		start, err := event.GetStartAt()
		if err != nil {
			continue
		}

		end, err := event.GetEndAt()
		if err != nil {
			continue
		}

		session := Session{
			SessionType: sessionType,
			Start:       start,
			End:         end,
		}

		round, exists := roundsMap[roundName]
		if !exists {
			// Create round map
			roundsMap[roundName] = &Round{
				Name:     roundName,
				Country:  location,
				Start:    start,
				End:      end,
				Sessions: []Session{session},
				Over:     false,
			}
		} else {
			// update existing round
			round.Sessions = append(round.Sessions, session)
			if start.Before(round.Start) {
				round.Start = start
			}

			if end.After(round.End) {
				round.End = end
			}
		}
	}

	// map to slice
	rounds := make([]Round, 0, len(roundsMap))
	for _, r := range roundsMap {
		r.Over = r.End.Before(now) // mark if over

		// sort sessions inside round based on start time
		sort.Slice(r.Sessions, func(i, j int) bool {
			return r.Sessions[i].Start.Before(r.Sessions[j].Start)
		})
		rounds = append(rounds, *r)
	}

	// sort round by start date
	sort.Slice(rounds, func(i, j int) bool {
		return rounds[i].Start.Before(rounds[j].Start)
	})
	return rounds, nil
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func F1CalendarHandler(w http.ResponseWriter, r *http.Request) {

	enableCORS(w)
	url := "https://ics.ecal.com/ecal-sub/660897ca63f9ca0008bcbea6/Formula%201.ics"

	cal, err := ics.ParseCalendarFromUrl(url)
	if err != nil {
		http.Error(w, "failed to parse the calendar", http.StatusInternalServerError)
		return
	}

	rounds, err := groupEventsToRounds(cal.Events())
	if err != nil {
		http.Error(w, "failed to group events", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rounds)
}
